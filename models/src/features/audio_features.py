"""
Acoustic feature extractor for speech prosody & vocal confidence analysis.
Extracts pitch (F0 mean, std, jitter), RMS energy, pause ratio, tempo, and 13 MFCCs.
"""
import numpy as np
import pandas as pd
import soundfile as sf
import librosa
from pathlib import Path


def extract_features_from_audio(file_path: str, target_sr: int = 16000) -> dict:
    """Extracts 33 prosodic and spectral acoustic features from a .wav audio file."""
    y, sr = sf.read(file_path)
    if y.ndim > 1:
        y = y.mean(axis=1)
    if sr != target_sr:
        y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
        sr = target_sr

    # Ensure audio is float32 normalized
    y = y.astype(np.float32)
    duration_s = max(0.1, len(y) / sr)

    # 1. Fundamental frequency (F0) tracking via short-time autocorrelation
    frame_size = int(sr * 0.04)  # 40ms window
    hop = int(sr * 0.02)         # 20ms step
    pitches = []
    
    for i in range(0, max(1, len(y) - frame_size), hop):
        frame = y[i:i + frame_size] * np.hanning(frame_size)
        if np.max(np.abs(frame)) < 0.01:
            continue
        corr = np.correlate(frame, frame, mode="full")
        corr = corr[len(corr) // 2:]
        d = np.diff(corr)
        starts = np.where(d > 0)[0]
        if len(starts) == 0:
            continue
        peak = starts[0] + np.argmax(corr[starts[0]:int(sr / 65)])
        if peak > 0:
            freq = sr / peak
            if 65.0 <= freq <= 450.0:
                pitches.append(freq)

    if pitches:
        f0_arr = np.array(pitches)
        f0_mean = float(np.mean(f0_arr))
        f0_std = float(np.std(f0_arr))
        f0_jitter = float(np.mean(np.abs(np.diff(f0_arr))) / max(1.0, f0_mean)) if len(f0_arr) > 1 else 0.0
    else:
        f0_mean = 130.0
        f0_std = 15.0
        f0_jitter = 0.02

    # 2. RMS Energy & Pause Ratio
    rms_frames = librosa.feature.rms(y=y, hop_length=hop)[0]
    rms_mean = float(np.mean(rms_frames))
    rms_var = float(np.var(rms_frames))
    max_rms = max(1e-6, np.max(rms_frames))
    pause_ratio = float(np.mean(rms_frames < (0.12 * max_rms)))

    # 3. Speech Tempo (estimated onset beat rate)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    onset_peaks = librosa.util.peak_pick(onset_env, pre_max=3, post_max=3, pre_avg=3, post_avg=3, delta=0.5, wait=5)
    tempo_bpm = float((len(onset_peaks) / duration_s) * 60.0)

    # 4. 13 MFCC Coefficients (mean and variance)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=hop)
    mfcc_means = np.mean(mfcc, axis=1)
    mfcc_vars = np.var(mfcc, axis=1)

    features = {
        "f0_mean": f0_mean,
        "f0_std": f0_std,
        "f0_jitter": f0_jitter,
        "rms_mean": rms_mean,
        "rms_var": rms_var,
        "pause_ratio": pause_ratio,
        "tempo_bpm": tempo_bpm,
    }
    for i in range(13):
        features[f"mfcc_{i+1}_mean"] = float(mfcc_means[i])
        features[f"mfcc_{i+1}_var"] = float(mfcc_vars[i])

    return features


def build_feature_dataset(manifest_path="data/raw/audio_manifest.csv", output_path="data/processed/audio_features.csv"):
    df_manifest = pd.read_csv(manifest_path)
    print(f"Extracting features from {len(df_manifest)} audio files...")
    
    records = []
    for idx, row in df_manifest.iterrows():
        try:
            feats = extract_features_from_audio(row["audio_path"])
            feats["filename"] = row["filename"]
            feats["actor"] = row["actor"]
            feats["vocal_confidence"] = row["vocal_confidence"]
            records.append(feats)
        except Exception as e:
            print(f"Skipping {row['filename']}: {e}")

    df_feats = pd.DataFrame(records)
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    df_feats.to_csv(out_file, index=False)
    
    print(f"Saved {len(df_feats)} acoustic feature vectors to {out_file}")
    return df_feats


if __name__ == "__main__":
    build_feature_dataset()
