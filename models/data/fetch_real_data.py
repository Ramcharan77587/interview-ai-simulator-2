"""
Fetch and normalize real human-graded short answer scoring dataset from Hugging Face.
Dataset: Short-Answer-Feedback/saf_communication_networks_english (technical CS/Networking QA).
"""
import re
import pandas as pd
from pathlib import Path
from datasets import load_dataset


def extract_keywords(text: str) -> str:
    """Extract key non-stopword technical tokens from reference answer for rubric concepts."""
    stopwords = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
        "by", "is", "are", "was", "were", "be", "been", "it", "its", "that", "this", "as",
        "which", "what", "how", "when", "where", "can", "could", "should", "from", "into"
    }
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    concepts = [w for w in words if w not in stopwords]
    # Deduplicate while preserving order
    seen = set()
    dedup = [c for c in concepts if not (c in seen or seen.add(c))]
    return ", ".join(dedup[:10])


def fetch_and_clean_data(output_path="data/raw/interviews_real.csv"):
    print("Loading Short-Answer-Feedback dataset from Hugging Face...")
    ds = load_dataset("Short-Answer-Feedback/saf_communication_networks_english")
    
    # Combine train and validation splits
    raw_dfs = [pd.DataFrame(ds["train"])]
    if "validation" in ds:
        raw_dfs.append(pd.DataFrame(ds["validation"]))
    df_raw = pd.concat(raw_dfs, ignore_index=True)

    # Normalize technical score to 0-100 based on each question's max score
    q_max = df_raw.groupby("question")["score"].transform("max").replace(0, 1.0)
    df_raw["technical_score"] = (df_raw["score"] / q_max) * 100.0
    df_raw["technical_score"] = df_raw["technical_score"].clip(0.0, 100.0).round(2)

    rows = []
    for _, item in df_raw.iterrows():
        q = str(item.get("question", "")).strip()
        ans = str(item.get("provided_answer", "")).strip()
        ref = str(item.get("reference_answer", "")).strip()
        tech = float(item["technical_score"])

        if not q or not ans or not ref:
            continue

        # Clarity proxy: fluency, structure, and length normalized to 0-100
        words = len(ans.split())
        length_score = min(1.0, words / 25.0) * 40.0
        punct_score = 15.0 if any(p in ans for p in [".", ",", ";", ":", "\n"]) else 5.0
        tech_contribution = tech * 0.45
        clarity = min(100.0, max(10.0, tech_contribution + length_score + punct_score))

        concepts = extract_keywords(ref)

        rows.append({
            "question": q,
            "answer": ans,
            "concepts": concepts,
            "technical_score": tech,
            "clarity_score": round(clarity, 2)
        })

    df = pd.DataFrame(rows)
    df.drop_duplicates(subset=["question", "answer"], inplace=True)
    
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_file, index=False)
    print(f"Saved {len(df)} cleaned human-graded samples to {out_file}")
    print("\nDataset Summary:")
    print(df[["technical_score", "clarity_score"]].describe())
    return df


if __name__ == "__main__":
    fetch_and_clean_data()
