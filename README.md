# Arabic Dialect to Modern Standard Arabic (MSA) Translation

Fine-tuning transformer models to translate Arabic dialects into Modern Standard Arabic (MSA) using the **MADAR** parallel corpus (25+ dialects grouped into Gulf, Levantine, Egyptian, etc.).

## Project Structure

```
Arabic MT/
├── app/                    # Web application
│   ├── backend.py          # Flask API server (loads AraT5 model)
│   ├── templates/
│   │   └── index.html      # UI with Islamic Arabic design
│   └── static/
│       ├── css/style.css
│       └── js/script.js
├── data/                   # Datasets
│   ├── Emi-NADI.csv
│   └── MADAR/
│       ├── data/           # MADAR parallel corpus splits
│       │   ├── egyMADARmsa.csv
│       │   ├── glfMADARmsa.csv
│       │   ├── levMADARmsa.csv
│       │   └── regMADARmsa.csv  # Merged (all regions)
│       ├── final_comparison_results.csv
│       ├── final_detailed_predictions.csv
│       └── MADAR.Parallel-Corpora-Public-Version1.1-25MAR2021/
├── models/                 # Trained model checkpoints
│   ├── arat5_reg/          # Best model — AraT5 (BLEU 71.56)
│   ├── mt5_small_reg/
│   ├── nllb600m_reg/
│   └── arabart_reg/
├── notebooks/
│   ├── DataPreparation.ipynb
│   ├── 01_FineTune_AraT5.ipynb       # Best performer
│   ├── 02_FineTune_mT5small.ipynb
│   ├── 03_FineTune_NLLB600M.ipynb
│   ├── 04_FineTune_AraBART.ipynb
│   └── 05_Compare_Vote_Test.ipynb
└── predictions/            # Test set predictions per model
    ├── arat5_reg_predictions.csv
    ├── mt5_small_reg_predictions.csv
    └── arabart_reg_predictions.csv
```

## Models & Results

| Model | BLEU | chrF |
|-------|------|------|
| **AraT5** | **71.56** | — |
| AraT5 (eval) | 46.76 | 62.67 |
| mT5-small | 37.82 | 53.14 |
| AraBART | 9.80 | 41.59 |
| Ensemble | 9.79 | 41.56 |

AraT5 (`UBC-NLP/AraT5-base`) achieved the best performance with BLEU **71.56** on the held-out test set.

## Dataset: MADAR Corpus

The [MADAR](https://camel-lab.com/madar/) corpus contains parallel sentences across 25+ Arabic dialect cities, grouped into:

- **Egyptian** (`egyMADARmsa.csv`)
- **Gulf** (`glfMADARmsa.csv`)
- **Levantine** (`levMADARmsa.csv`)
- **Combined** (`regMADARmsa.csv`) — all dialects merged

Each row: `dialect_sentence, MSA_sentence`

### Data size (merged)
- Total pairs: ~50,923
- Train: 45,830
- Validation: 2,546
- Test: 2,547

## Web Application

A Flask-based UI with an Islamic Arabic design serves the best model (AraT5).

### Run

```bash
cd app
python app.py
```

Open `http://localhost:5000` in your browser. Type a dialect sentence and click "ترجمة" to translate to MSA.

### API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the web UI |
| `/api/translate` | POST | Translate dialect → MSA |
| `/api/health` | GET | Model status |

**Translate example:**

```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "عامل ايه"}'
```

## Requirements

- Python 3.10+
- PyTorch (CUDA recommended)
- Transformers
- Flask
- pandas, datasets, evaluate, sacrebleu

## Training Notes

- All models trained for 30 epochs with batch size 16, learning rate 1e-4.
- AraT5 trained on NVIDIA RTX 2000 Ada (CUDA).
- Random seed 42 used across all splits for consistent test sets.
- FP16 disabled for T5-family models (causes NaN); BF16 used when supported.

the Model: https://drive.google.com/drive/folders/1WuTLjVn10eALqjfMuw_VSM-ZA0k7fEmR?usp=sharing
