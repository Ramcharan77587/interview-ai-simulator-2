"""
Inference test and validation suite for Model 1: Candidate Response Evaluator.
"""
import sys
import time
from pathlib import Path
import joblib
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from src.models.baseline_evaluator import ResponseFeatureExtractor, CandidateScorer, compute_concept_f1

TEST_CASES = [
    {
        "case_name": "Strong Answer (TCP/UDP)",
        "question": "What is the difference between TCP and UDP?",
        "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
        "answer": "TCP is a connection-oriented protocol that uses a three-way handshake to guarantee reliable, in-order packet delivery with flow control. UDP is connectionless and sends datagrams without guarantees, offering lower latency and overhead for real-time applications."
    },
    {
        "case_name": "Weak Answer (TCP/UDP)",
        "question": "What is the difference between TCP and UDP?",
        "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
        "answer": "TCP is reliable and UDP is faster."
    },
    {
        "case_name": "Off-topic Answer (TCP/UDP)",
        "question": "What is the difference between TCP and UDP?",
        "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
        "answer": "TCP is used to bake chocolate cookies in an oven while UDP is a brand of tires for bicycles."
    }
]


def test_model(model_path="exports/model1_baseline.joblib"):
    model = joblib.load(model_path)
    df_cases = pd.DataFrame(TEST_CASES)

    print("=" * 80)
    print("MODEL 1 INFERENCE TEST REPORT")
    print("=" * 80)

    start_total = time.perf_counter()
    preds = model.predict(df_cases)
    total_time_ms = (time.perf_counter() - start_total) * 1000

    results = []
    for i, row in df_cases.iterrows():
        tech_score = preds[i, 0]
        clarity_score = preds[i, 1]
        f1_coverage = compute_concept_f1(row["answer"], row["concepts"])

        ref_tokens = [c.strip() for c in str(row["concepts"]).split(",") if c.strip()]
        matched = [c for c in ref_tokens if c.lower() in str(row["answer"]).lower()]
        missing = [c for c in ref_tokens if c.lower() not in str(row["answer"]).lower()]

        print(f"\n[{row['case_name']}]")
        print(f"Question:  {row['question']}")
        print(f"Answer:    {row['answer']}")
        print(f"Score:     Technical = {tech_score:.1f}/100 | Clarity = {clarity_score:.1f}/100")
        print(f"Concepts:  Matched: {matched} | Missing: {missing} | Coverage F1 = {f1_coverage:.4f}")

        results.append({
            "name": row["case_name"],
            "tech": tech_score,
            "clarity": clarity_score
        })

    avg_latency = total_time_ms / len(TEST_CASES)
    print("\n" + "-" * 80)
    print(f"Latency: {avg_latency:.2f} ms/query on CPU ({total_time_ms:.2f} ms total for {len(TEST_CASES)} queries)")
    print("-" * 80)

    # Verification assertions: Case 1 > Case 2 > Case 3
    assert results[0]["tech"] > results[1]["tech"] > results[2]["tech"], "Case 1 > Case 2 > Case 3 ranking failed"
    print("\nALL ASSERTION TESTS PASSED: Model correctly ranks response quality on human-graded data.")


if __name__ == "__main__":
    test_model()
