# Machine Learning Workflow & Operating Procedures

This document defines standard operating procedures and best practices for developing, training, and evaluating machine learning models in this workspace.

---

## 1. Data Exploration & Inspection

- **Data Sourcing**:
  - Use the **BigQuery MCP** tools to discover datasets, inspect schemas, and query enterprise data warehouse tables directly.
  - For local or staged datasets (CSV, Parquet, JSON), use **pandas** or **pyarrow** with explicit typing and chunked streaming if working with large files.
- **Exploratory Data Analysis (EDA)**:
  - Verify row counts, data types, column distributions, and value frequencies before modeling.
  - **Missing & Null Values**: Always check null/NaN counts and percentages. Decide whether to drop, impute (mean, median, mode, KNN), or add missingness indicator columns. Document the rationale.
  - **Outlier & Anomaly Detection**: Identify extreme values and skewed distributions via summary statistics (`describe()`) and IQR/Z-score thresholds.
- **Strict Featurization Ordering & Leakage Prevention**:
  - **Always split data** into Train, Validation, and Test sets *before* fitting preprocessing transformers (scalers, encoders, imputers).
  - Preprocessing pipelines must be fitted exclusively on the training split and applied to validation/test splits.
  - For temporal data, always use chronological splits rather than random shuffles.

---

## 2. Iterative Experimentation & Script Modularization

- **Notebook-First Prototyping**:
  - Conduct initial data exploration, feature engineering, and quick baseline trials within Jupyter Notebooks (`.ipynb`).
  - Use the local virtual environment kernel (`.venv` ipykernel) for execution.
  - Structure notebooks with narrative discipline: follow code execution cells with Markdown cells interpreting output metrics, plots, and insights.
- **Exporting to Standalone Training Scripts**:
  - Once model architecture and feature pipelines stabilize, refactor notebook code into modular, production-ready Python modules:
    - `src/data/`: Data loading, preprocessing, and dataset definitions.
    - `src/models/`: Model architecture definitions and loss functions.
    - `src/training/`: Training loops, optimization, and validation procedures.
    - `train.py`: CLI entry point taking hyperparameters via arguments or config files (`argparse`, `dataclasses`, or YAML).
    - `evaluate.py`: Evaluation pipeline producing confusion matrices, classification reports, and test metrics.

---

## 3. Hardware Acceleration & Model Checkpointing

- **Device Management & CUDA Acceleration**:
  - Dynamically detect and assign computation devices:
    ```python
    import torch
    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using device: {device}")
    ```
  - Pin seeds across Python (`random.seed`), NumPy (`np.random.seed`), and PyTorch (`torch.manual_seed`, `torch.cuda.manual_seed_all`) to ensure deterministic experiments.
  - Utilize mixed precision (`torch.amp.autocast`) when training larger models on compatible GPUs to optimize memory and throughput.
- **Checkpointing Best Practices**:
  - Save checkpoints at regular intervals (e.g., end of each epoch) and keep track of the best validation checkpoint:
    ```python
    checkpoint = {
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "val_loss": val_loss,
        "metrics": metrics,
    }
    torch.save(checkpoint, "checkpoints/best_model.pt")
    ```
  - For Hugging Face Transformers models, use `model.save_pretrained(save_directory)` and `tokenizer.save_pretrained(save_directory)`.
  - Maintain a clean directory structure (e.g., `checkpoints/`, `runs/`) and add large model weights (`*.pt`, `*.bin`, `*.safetensors`) to `.gitignore` when appropriate.

---

## 4. Evaluation Metrics & Progress Tracking

- **Metric Tracking at Every Step**:
  - Track and display key metrics during training and validation:
    - **Regression**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), R-squared ($R^2$).
    - **Classification**: Cross-Entropy Loss, Accuracy, Precision, Recall, and F1-Score (macro- and weighted-averaged).
  - Always report validation metrics alongside training metrics to detect overfitting or underfitting early.
- **Error Analysis & Baseline Comparison**:
  - Compare model performance against naive baselines (e.g., majority class classifier or mean predictor) and simple standard models (e.g., Logistic Regression or LightGBM).
  - Inspect confusion matrices, calibration curves, and slice-level errors across specific subcategories to detect bias or blind spots.
- **Experiment Records**:
  - Record hyperparameter sets, data split hashes, and final test results in structured logs or metadata JSONs for full reproducibility.
