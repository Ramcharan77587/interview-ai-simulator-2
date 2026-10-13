"""
Download real speech samples from RAVDESS and map to interview confidence classes:
- Confident: High energy, positive vocal projection (Happy 03)
- Steady: Neutral (01) & Calm (02)
- Hesitant/Nervous: Wavering pitch, low energy, fearful/hesitant (Fearful 06, Sad 04)
"""
import os
import pandas as pd
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from huggingface_hub import hf_hub_download

# RAVDESS emotion codes:
# 01 = neutral, 02 = calm, 03 = happy, 04 = sad, 05 = angry, 06 = fearful, 07 = disgust, 08 = surprised
EMOTION_MAP = {
    "01": "Steady",
    "02": "Steady",
    "03": "Confident",
    "04": "Hesitant/Nervous",
    "06": "Hesitant/Nervous"
}


def download_single_clip(item):
    actor_str, filename, emotion_code, target_class = item
    hf_path = f"{actor_str}/{filename}"
    target_dest = Path("data/raw/audio") / filename
    try:
        if not target_dest.exists():
            local_cached = hf_hub_download(
                repo_id="birgermoell/ravdess",
                filename=hf_path,
                repo_type="dataset"
            )
            target_dest.parent.mkdir(parents=True, exist_ok=True)
            import shutil
            shutil.copyfile(local_cached, target_dest)
        return {
            "audio_path": f"data/raw/audio/{filename}",
            "filename": filename,
            "actor": actor_str,
            "emotion_code": emotion_code,
            "vocal_confidence": target_class
        }
    except Exception:
        return None


def download_audio_data(max_actors=4, max_workers=8):
    print(f"Downloading RAVDESS speech subset for {max_actors} actors via ThreadPool...")
    queue = []
    for actor_id in range(1, max_actors + 1):
        actor_str = f"Actor_{actor_id:02d}"
        for emotion_code, target_class in EMOTION_MAP.items():
            for statement in ["01", "02"]:
                for repetition in ["01", "02"]:
                    for intensity in (["01", "02"] if emotion_code in ["03", "06"] else ["01"]):
                        filename = f"03-01-{emotion_code}-{intensity}-{statement}-{repetition}-{actor_id:02d}.wav"
                        queue.append((actor_str, filename, emotion_code, target_class))

    manifest_rows = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(download_single_clip, item) for item in queue]
        for f in as_completed(futures):
            res = f.result()
            if res:
                manifest_rows.append(res)

    df_manifest = pd.DataFrame(manifest_rows)
    df_manifest.drop_duplicates(subset=["audio_path"], inplace=True)
    manifest_file = Path("data/raw/audio_manifest.csv")
    manifest_file.parent.mkdir(parents=True, exist_ok=True)
    df_manifest.to_csv(manifest_file, index=False)
    
    print(f"Downloaded and indexed {len(df_manifest)} audio clips to {manifest_file}")
    print("\nClass Distribution:")
    print(df_manifest["vocal_confidence"].value_counts())
    return df_manifest


if __name__ == "__main__":
    download_audio_data()
