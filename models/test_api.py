"""
End-to-End API verification test suite using FastAPI TestClient.
Tests /health, /api/ml/match, /api/ml/evaluate-answer, and /api/ml/analyze-audio.
Verifies response schemas, correctness, and latency (< 150 ms).
"""
import time
import pandas as pd
from pathlib import Path
from fastapi.testclient import TestClient

from app import app


def run_api_tests():
    print("=" * 80)
    print("FASTAPI PRODUCTION API VERIFICATION SUITE")
    print("=" * 80)

    # Initialize TestClient within lifespan context
    with TestClient(app) as client:

        # 1. GET /health
        t0 = time.perf_counter()
        resp_health = client.get("/health")
        t_health = (time.perf_counter() - t0) * 1000

        print(f"\n[GET /health] Status={resp_health.status_code} in {t_health:.2f} ms")
        assert resp_health.status_code == 200, "Health check failed"
        health_data = resp_health.json()
        print("  Response:", health_data)
        assert health_data["status"] == "healthy"
        assert health_data["models_loaded"] == 3

        # 2. POST /api/ml/match
        sample_jd = "Senior Backend Engineer: Need expertise in Distributed Systems, Kafka, Go, Redis, and Kubernetes."
        sample_resume = "Software Engineer: 4 years experience with Python, FastAPI, PostgreSQL, Docker, and Linux."
        
        t0 = time.perf_counter()
        resp_match = client.post("/api/ml/match", json={
            "resume_text": sample_resume,
            "job_description": sample_jd,
            "difficulty": "Senior"
        })
        t_match = (time.perf_counter() - t0) * 1000

        print(f"\n[POST /api/ml/match] Status={resp_match.status_code} in {t_match:.2f} ms")
        assert resp_match.status_code == 200, f"Match endpoint failed: {resp_match.text}"
        match_data = resp_match.json()
        print(f"  Match Score:    {match_data['match_score']}%")
        print(f"  Matched Skills: {match_data['matched_skills']}")
        print(f"  Missing Gaps:   {match_data['missing_skills']}")
        print(f"  Questions ({len(match_data['questions'])}):")
        for q in match_data["questions"]:
            print(f"    - [{q['topic']}] {q['question'][:75]}...")

        assert "Distributed Systems" in match_data["missing_skills"]
        assert "Kafka" in match_data["missing_skills"]
        assert len(match_data["questions"]) == 4

        # 3. POST /api/ml/evaluate-answer
        eval_payload = {
            "question": "What is the difference between TCP and UDP?",
            "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
            "answer": "TCP is a connection-oriented protocol with a three-way handshake ensuring reliable in-order packet delivery. UDP is connectionless and sends datagrams without guarantees."
        }
        
        t0 = time.perf_counter()
        resp_eval = client.post("/api/ml/evaluate-answer", json=eval_payload)
        t_eval = (time.perf_counter() - t0) * 1000

        print(f"\n[POST /api/ml/evaluate-answer] Status={resp_eval.status_code} in {t_eval:.2f} ms")
        assert resp_eval.status_code == 200, f"Evaluate endpoint failed: {resp_eval.text}"
        eval_data = resp_eval.json()
        print(f"  Technical Score:  {eval_data['technical_score']}/100")
        print(f"  Clarity Score:    {eval_data['clarity_score']}/100")
        print(f"  Matched Concepts: {eval_data['matched_concepts']}")
        print(f"  Concept F1:       {eval_data['concept_f1']}")

        assert eval_data["technical_score"] >= 50.0
        assert len(eval_data["matched_concepts"]) >= 4

        # 4. POST /api/ml/parse-resume
        sample_resume_content = b"Senior Software Engineer\nSkills: Python, FastAPI, PostgreSQL, Docker, Kubernetes, Distributed Systems\nExperience building scalable cloud APIs."
        t0 = time.perf_counter()
        resp_parse = client.post(
            "/api/ml/parse-resume",
            files={"file": ("resume.txt", sample_resume_content, "text/plain")}
        )
        t_parse = (time.perf_counter() - t0) * 1000
        print(f"\n[POST /api/ml/parse-resume] Status={resp_parse.status_code} in {t_parse:.2f} ms")
        assert resp_parse.status_code == 200, f"Parse resume endpoint failed: {resp_parse.text}"
        parse_data = resp_parse.json()
        print(f"  Extracted Chars:  {parse_data['char_count']}")
        print(f"  Detected Skills:  {parse_data['detected_skills']}")
        assert "Python" in parse_data["detected_skills"]
        assert "FastAPI" in parse_data["detected_skills"]

        # 5. POST /api/ml/analyze-audio
        sample_audio_file = Path("data/sample_speech.wav")
        if not sample_audio_file.exists():
            # If not yet generated, create fallback test tone
            import numpy as np, soundfile as sf
            sr = 16000
            t = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
            y = (0.5 * np.sin(2 * np.pi * 220 * t)).astype(np.float32)
            sf.write(str(sample_audio_file), y, sr)
        
        # Warmup pass
        with open(sample_audio_file, "rb") as f:
            _ = client.post("/api/ml/analyze-audio", files={"file": ("test.wav", f, "audio/wav")})

        t0 = time.perf_counter()
        with open(sample_audio_file, "rb") as f:
            resp_audio = client.post(
                "/api/ml/analyze-audio",
                files={"file": ("test.wav", f, "audio/wav")}
            )
        t_audio = (time.perf_counter() - t0) * 1000


        print(f"\n[POST /api/ml/analyze-audio] Status={resp_audio.status_code} in {t_audio:.2f} ms")
        assert resp_audio.status_code == 200, f"Audio endpoint failed: {resp_audio.text}"
        audio_data = resp_audio.json()
        print(f"  Vocal State:      {audio_data['vocal_state']}")
        print(f"  Confidence Score: {audio_data['confidence_score']}")
        print(f"  Pitch F0:         {audio_data['f0_hz']} Hz")
        print(f"  RMS Variance:     {audio_data['rms_var']}")
        print(f"  Jitter:           {audio_data['jitter']}")

        assert audio_data["vocal_state"] in ["Confident", "Steady", "Hesitant/Nervous"]
        assert audio_data["confidence_score"] > 0.0

        # Latency assertions (all steady-state requests < 150 ms)
        latencies = {
            "health": t_health,
            "match": t_match,
            "evaluate": t_eval,
            "audio": t_audio
        }
        print("\n" + "=" * 80)
        print("LATENCY BENCHMARK REPORT (Target < 150 ms)")
        print("=" * 80)
        for ep, lat in latencies.items():
            print(f"  Endpoint {ep:10s} : {lat:6.2f} ms")
            assert lat < 150.0, f"Endpoint {ep} exceeded 150ms latency budget ({lat:.2f}ms)"

        print("\nALL API ENDPOINTS VERIFIED AND COMPLIANT WITH LATENCY BUDGETS.")


if __name__ == "__main__":
    run_api_tests()
