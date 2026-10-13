"""
Model 1: Candidate Response Evaluator & Rubric Scorer
Trained on real human-graded short answer scoring dataset (Short-Answer-Feedback).
Ridge regression with TF-IDF and rubric concept overlap feature extraction.
"""
import time
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from scipy.sparse import csr_matrix, hstack
from scipy.stats import pearsonr
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

import sys
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
sys.modules["src.models.baseline_evaluator"] = sys.modules[__name__]

SEED = 42
np.random.seed(SEED)


def compute_concept_f1(candidate_answer: str, reference_concepts: str) -> float:
    """Computes token-level precision/recall/F1 for key concepts in the answer."""
    ref_tokens = {c.strip().lower() for c in str(reference_concepts).split(",") if c.strip()}
    if not ref_tokens:
        return 0.0
    ans_text = str(candidate_answer).lower()
    matches = sum(1 for token in ref_tokens if token in ans_text)
    prec = matches / max(1, len(ans_text.split()))
    rec = matches / len(ref_tokens)
    return (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0


class ResponseFeatureExtractor(BaseEstimator):
    """Combines candidate answer TF-IDF with explicit rubric overlap signals."""
    __module__ = "src.models.baseline_evaluator"

    def __init__(self):
        self.tfidf_ans = TfidfVectorizer(ngram_range=(1, 2), max_features=3500, stop_words="english", sublinear_tf=True)
        self.tfidf_ref = TfidfVectorizer(ngram_range=(1, 2), max_features=1500, stop_words="english")

    def fit(self, X, y=None):
        ans_col = "answer" if "answer" in X.columns else "candidate_answer"
        ref_col = "concepts" if "concepts" in X.columns else "reference_concepts"
        self.tfidf_ans.fit(X[ans_col].astype(str))
        self.tfidf_ref.fit(X[ref_col].astype(str))
        return self

    def transform(self, X):
        ans_col = "answer" if "answer" in X.columns else "candidate_answer"
        ref_col = "concepts" if "concepts" in X.columns else "reference_concepts"
        ans_vecs = self.tfidf_ans.transform(X[ans_col].astype(str))
        ref_vecs = self.tfidf_ref.transform(X[ref_col].astype(str))
        ans_on_ref = self.tfidf_ref.transform(X[ans_col].astype(str))

        # Vectorized cosine similarity between candidate answers and reference rubrics
        dot_prods = np.asarray(ans_on_ref.multiply(ref_vecs).sum(axis=1)).ravel()
        norm_a = np.sqrt(np.asarray(ans_on_ref.multiply(ans_on_ref).sum(axis=1)).ravel())
        norm_r = np.sqrt(np.asarray(ref_vecs.multiply(ref_vecs).sum(axis=1)).ravel())
        denom = np.maximum(1e-9, norm_a * norm_r)
        cos_sims = dot_prods / denom

        dense_feats = []
        for idx, (r, a) in enumerate(zip(X[ref_col], X[ans_col])):
            ref_tokens = [c.strip().lower() for c in str(r).split(",") if c.strip()]
            a_lower = str(a).lower()
            matched = sum(1 for tok in ref_tokens if tok in a_lower)
            recall = matched / max(1, len(ref_tokens))
            f1 = compute_concept_f1(str(a), str(r))
            sim = float(cos_sims[idx])
            words = max(1, len(str(a).split()))
            # Length only contributes positively when concepts / cosine similarity are present
            gated_length = min(words, 40) * (recall + sim) / 20.0
            zero_penalty = -15.0 if (matched == 0 and sim == 0.0) else 0.0
            dense_feats.append([recall * 12.0, f1 * 10.0, sim * 15.0, gated_length * 2.0, zero_penalty])

        dense_sparse = csr_matrix(dense_feats)
        return hstack([ans_vecs, dense_sparse])


class CandidateScorer(BaseEstimator, RegressorMixin):
    """Multi-target regressor predicting technical and clarity scores (0-100)."""
    __module__ = "src.models.baseline_evaluator"

    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.pipeline = Pipeline([
            ("features", ResponseFeatureExtractor()),
            ("regressor", Ridge(alpha=self.alpha, random_state=SEED))
        ])

    def fit(self, X, y):
        self.pipeline.fit(X, y)
        return self

    def predict(self, X):
        preds = self.pipeline.predict(X)
        return np.clip(preds, 0, 100)


def evaluate_split(y_true, y_pred, name="Test"):
    """Computes MAE, RMSE, and Pearson correlation for technical & clarity scores."""
    metrics = {}
    for idx, target in enumerate(["technical_score", "clarity_score"]):
        mae = mean_absolute_error(y_true[:, idx], y_pred[:, idx])
        rmse = root_mean_squared_error(y_true[:, idx], y_pred[:, idx])
        r, _ = pearsonr(y_true[:, idx], y_pred[:, idx]) if len(np.unique(y_pred[:, idx])) > 1 else (0.0, 1.0)
        metrics[f"{target}_mae"] = mae
        metrics[f"{target}_rmse"] = rmse
        metrics[f"{target}_pearson_r"] = r
        print(f"[{name}] {target.upper()} -> MAE: {mae:.2f}, RMSE: {rmse:.2f}, Pearson r: {r:.4f}")
    return metrics


def run_pipeline(data_path="data/raw/interviews_real.csv"):
    df = pd.read_csv(data_path)
    ans_col = "answer" if "answer" in df.columns else "candidate_answer"
    q_col = "question" if "question" in df.columns else "question_text"
    ref_col = "concepts" if "concepts" in df.columns else "reference_concepts"

    X = df[[q_col, ref_col, ans_col]]
    y = df[["technical_score", "clarity_score"]].values

    # Strict 80/10/10 train/val/test split before fitting transformers
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.20, random_state=SEED)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=SEED)

    print(f"Data Split (Real Human-Graded): Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

    # 1. Naive Baseline (Mean Predictor)
    mean_preds_test = np.tile(y_train.mean(axis=0), (len(y_test), 1))
    print("\n--- Naive Baseline (Mean Predictor) ---")
    evaluate_split(y_test, mean_preds_test, name="Naive Test")

    # 2. Ridge + TF-IDF Baseline (Fitted ONLY on training split)
    print("\n--- Ridge + TF-IDF Baseline ---")
    model = CandidateScorer(alpha=1.0)
    model.fit(X_train, y_train)

    val_preds = model.predict(X_val)
    evaluate_split(y_val, val_preds, name="Val")

    test_preds = model.predict(X_test)
    test_metrics = evaluate_split(y_test, test_preds, name="Test")

    # Latency test on CPU
    start = time.perf_counter()
    sample = X_test.iloc[:1]
    _ = model.predict(sample)
    latency_ms = (time.perf_counter() - start) * 1000
    print(f"Single-inference CPU Latency: {latency_ms:.2f} ms (Target < 200 ms)")

    # Export Model
    export_path = Path("exports/model1_baseline.joblib")
    export_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, export_path)
    print(f"Saved model pipeline to {export_path}")

    # 3. Sanity Check on 3 Contrasting Test Cases
    print("\n" + "=" * 80)
    print("SANITY CHECK: 3 CONTRASTING TEST CASES")
    print("=" * 80)
    test_cases = pd.DataFrame([
        {
            "question": "What is the difference between TCP and UDP?",
            "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
            "answer": "TCP is a connection-oriented protocol that uses a three-way handshake to guarantee reliable, in-order packet delivery with flow control. UDP is connectionless and sends datagrams without guarantees, offering lower latency and overhead for real-time applications."
        },
        {
            "question": "What is the difference between TCP and UDP?",
            "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
            "answer": "TCP is reliable and UDP is faster."
        },
        {
            "question": "What is the difference between TCP and UDP?",
            "concepts": "connection, handshake, reliable, order, stream, datagram, fast, connectionless, overhead",
            "answer": "TCP is used to bake chocolate cookies in an oven while UDP is a brand of tires for bicycles."
        }
    ])
    sanity_preds = model.predict(test_cases)
    labels = ["Case 1 (Strong Answer)", "Case 2 (Weak Answer)", "Case 3 (Off-topic Answer)"]
    for i, label in enumerate(labels):
        print(f"[{label}]")
        print(f"  Answer: {test_cases.iloc[i]['answer']}")
        print(f"  Technical Score: {sanity_preds[i, 0]:.1f}/100 | Clarity Score: {sanity_preds[i, 1]:.1f}/100")

    # Assertions: Verify Case 1 > Case 2 > Case 3
    assert sanity_preds[0, 0] > sanity_preds[1, 0] > sanity_preds[2, 0], "Case 1 > Case 2 > Case 3 must hold"
    print("\nSanity Check Verified: Case 1 > Case 2 > Case 3 passed.")
    return model


if __name__ == "__main__":
    run_pipeline()
