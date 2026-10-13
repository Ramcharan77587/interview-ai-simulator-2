"""
Model 2: Speech Prosody & Vocal Confidence Classifier
Trained on RAVDESS acoustic prosody features.
Predicts interview vocal confidence: [Confident, Steady, Hesitant/Nervous].
"""
import time
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from src.features.audio_features import extract_features_from_audio

SEED = 42
np.random.seed(SEED)

CLASSES = ["Confident", "Steady", "Hesitant/Nervous"]


def run_audio_training(data_path="data/processed/audio_features.csv"):
    df = pd.read_csv(data_path)
    
    # Feature columns (33 acoustic features)
    feature_cols = [
        col for col in df.columns
        if col not in ["filename", "actor", "vocal_confidence", "audio_path"]
    ]
    
    X = np.asarray(df[feature_cols].values, dtype=np.float32)
    y = np.asarray(df["vocal_confidence"].values, dtype=str)

    # Strict 80/10/10 stratified split
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.20, random_state=SEED, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=SEED, stratify=y_temp
    )

    print(f"Dataset Split (Audio Samples): Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    print(f"Features: {len(feature_cols)} acoustic prosodic & spectral descriptors")

    # Build Pipeline with StandardScaler (fitted strictly on train split)
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(
            C=0.5,
            max_iter=1000,
            random_state=SEED
        ))
    ])

    pipeline.fit(X_train, y_train)

    # Validation evaluation
    val_preds = pipeline.predict(X_val)
    val_acc = accuracy_score(y_val, val_preds)
    val_f1 = f1_score(y_val, val_preds, average="macro")
    print(f"\n[Validation] Accuracy: {val_acc:.4f} | Macro-F1: {val_f1:.4f}")

    # Test evaluation
    test_preds = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds)
    test_f1 = f1_score(y_test, test_preds, average="macro")
    print(f"[Test]       Accuracy: {test_acc:.4f} | Macro-F1: {test_f1:.4f}")

    print("\nConfusion Matrix (Test Split):")
    labels = ["Confident", "Steady", "Hesitant/Nervous"]
    cm = confusion_matrix(y_test, test_preds, labels=labels)
    cm_df = pd.DataFrame(cm, index=[f"True_{c}" for c in labels], columns=[f"Pred_{c}" for c in labels])
    print(cm_df)

    print("\nClassification Report (Test Split):")
    print(classification_report(y_test, test_preds, labels=labels, zero_division=0))

    # Latency test on CPU (Feature vector inference)
    start = time.perf_counter()
    _ = pipeline.predict(X_test[:1])
    infer_latency_ms = (time.perf_counter() - start) * 1000
    print(f"Model Inference CPU Latency: {infer_latency_ms:.2f} ms (Target < 200 ms)")

    # Export Pipeline & Feature Schema
    export_bundle = {
        "pipeline": pipeline,
        "feature_cols": feature_cols,
        "classes": labels
    }
    out_path = Path("exports/model2_audio_confidence.joblib")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(export_bundle, out_path)
    print(f"Saved Model 2 pipeline bundle to {out_path}")

    # Assertions
    assert out_path.exists(), "Model export failed"
    assert test_acc >= 0.60, f"Baseline accuracy too low: {test_acc}"
    return export_bundle


def predict_audio_clip(audio_path: str, model_bundle_path="exports/model2_audio_confidence.joblib") -> dict:
    """Predicts vocal confidence class and probabilities directly from a raw audio file."""
    bundle = joblib.load(model_bundle_path)
    pipeline = bundle["pipeline"]
    feature_cols = bundle["feature_cols"]

    t0 = time.perf_counter()
    feats = extract_features_from_audio(audio_path)
    feat_vector = np.array([[feats[col] for col in feature_cols]])
    
    pred_class = pipeline.predict(feat_vector)[0]
    probs = pipeline.predict_proba(feat_vector)[0]
    total_ms = (time.perf_counter() - t0) * 1000

    prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(pipeline.classes_, probs)}
    return {
        "predicted_confidence": pred_class,
        "probabilities": prob_dict,
        "latency_ms": round(total_ms, 2),
        "key_prosody": {
            "f0_mean_hz": round(feats["f0_mean"], 1),
            "f0_jitter": round(feats["f0_jitter"], 4),
            "rms_variance": round(feats["rms_var"], 6),
            "pause_ratio": round(feats["pause_ratio"], 3),
            "tempo_bpm": round(feats["tempo_bpm"], 1)
        }
    }


if __name__ == "__main__":
    run_audio_training()
