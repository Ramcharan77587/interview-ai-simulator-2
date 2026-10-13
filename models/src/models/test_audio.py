"""
Sanity test and verification suite for Model 2: Vocal Confidence Classifier.
Verifies contrasting speech clips: High-energy Confident vs. Low-energy Hesitant/Nervous.
"""
import sys
import pandas as pd
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from src.models.audio_evaluator import predict_audio_clip


def run_sanity_tests():
    manifest_path = Path("data/raw/audio_manifest.csv")
    sample_wav = Path("data/sample_speech.wav")

    # If sample_speech.wav doesn't exist, create synthetic test tone
    if not sample_wav.exists():
        import numpy as np, soundfile as sf
        sr = 16000
        t = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
        y = (0.5 * np.sin(2 * np.pi * 220 * t)).astype(np.float32)
        sf.write(str(sample_wav), y, sr)

    print("=" * 80)
    print("MODEL 2: VOCAL CONFIDENCE INFERENCE SANITY CHECK")
    print("=" * 80)

    # Check if raw RAVDESS dataset audio files exist locally
    has_full_dataset = False
    if manifest_path.exists():
        df_manifest = pd.read_csv(manifest_path)
        first_audio = df_manifest.iloc[0]["audio_path"]
        if Path(first_audio).exists():
            has_full_dataset = True

    if has_full_dataset:
        df_manifest = pd.read_csv(manifest_path)
        test_cases = [
            {
                "case_name": "High-Energy Confident Speech",
                "expected": "Confident",
                "row": df_manifest[df_manifest["vocal_confidence"] == "Confident"].iloc[0]
            },
            {
                "case_name": "Low-Energy Hesitant / Monotone Speech",
                "expected": "Hesitant/Nervous",
                "row": df_manifest[df_manifest["vocal_confidence"] == "Hesitant/Nervous"].iloc[0]
            },
            {
                "case_name": "Controlled Steady Speech",
                "expected": "Steady",
                "row": df_manifest[df_manifest["vocal_confidence"] == "Steady"].iloc[0]
            }
        ]

        # JIT warm-up pass
        _ = predict_audio_clip(test_cases[0]["row"]["audio_path"])

        results = []
        for tc in test_cases:
            audio_file = tc["row"]["audio_path"]
            res = predict_audio_clip(audio_file)
            results.append(res)

            print(f"\n[{tc['case_name']}]")
            print(f"File:       {tc['row']['filename']} ({tc['row']['actor']})")
            print(f"Predicted:  {res['predicted_confidence']} (Expected: {tc['expected']})")
            print(f"Confidence: {res['probabilities']}")
            print(f"Prosody:    F0={res['key_prosody']['f0_mean_hz']} Hz | Jitter={res['key_prosody']['f0_jitter']} | RMS Var={res['key_prosody']['rms_variance']} | Pause Ratio={res['key_prosody']['pause_ratio']}")
            print(f"Latency:    {res['latency_ms']} ms (Target < 200 ms)")

        conf_res = results[0]
        hes_res = results[1]
        
        assert conf_res["probabilities"]["Confident"] > hes_res["probabilities"]["Confident"], \
            "Confident clip should have higher Confident probability than hesitant clip"
        assert hes_res["probabilities"]["Hesitant/Nervous"] > conf_res["probabilities"]["Hesitant/Nervous"], \
            "Hesitant clip should have higher Hesitant probability than confident clip"
        assert all(r["latency_ms"] < 200.0 for r in results), \
            "End-to-end audio inference exceeded 200 ms budget"

        print("\n" + "-" * 80)
        print("ALL ASSERTION TESTS PASSED: Model 2 accurately separates vocal prosody profiles.")
        print("-" * 80)
    else:
        # JIT / numba warm-up pass
        _ = predict_audio_clip(str(sample_wav))

        # Run test on portable sample audio
        print(f"\n[Portable Audio Test] Testing inference on {sample_wav}...")
        res = predict_audio_clip(str(sample_wav))
        print(f"Predicted State: {res['predicted_confidence']}")
        print(f"Probabilities:   {res['probabilities']}")
        print(f"Prosody:         F0={res['key_prosody']['f0_mean_hz']} Hz | Jitter={res['key_prosody']['f0_jitter']} | RMS Var={res['key_prosody']['rms_variance']}")
        print(f"Latency:         {res['latency_ms']} ms (Target < 200 ms)")
        assert res["latency_ms"] < 200.0, f"Audio inference exceeded 200 ms budget: {res['latency_ms']} ms"
        assert res["predicted_confidence"] in ["Confident", "Steady", "Hesitant/Nervous"]
        print("\nNote: Full RAVDESS dataset audio files are not in Git repository (~200MB).")
        print("To download the complete 1,440-file audio dataset, run: python data/fetch_audio_data.py")
        print("-" * 80)
        print("ALL ASSERTION TESTS PASSED: Model 2 audio prosody extraction and inference working.")
        print("-" * 80)


if __name__ == "__main__":
    run_sanity_tests()
