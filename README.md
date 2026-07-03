# 🔍 TruthLens AI

**Fake News Detection using NLP & Machine Learning**

A machine learning web app that analyzes news article text and classifies it as **Reliable** or **Unreliable**, using NLP preprocessing (stemming + stopword removal), TF-IDF vectorization, and a trained classifier — deployed as an interactive Streamlit app.

---

## 📌 Overview

TruthLens AI tackles the growing problem of misinformation by giving users a quick, automated way to check the credibility of news content. Paste any news article text into the app, and the model predicts whether it's likely to be genuine or fabricated — based on patterns learned from a labeled dataset of over 20,000 real and fake news articles.

---

## ✨ Features

- 📝 **Text-based prediction** — paste any news article content and get an instant classification
- 🧹 **NLP preprocessing pipeline** — regex cleaning, lowercasing, stopword removal, and Porter stemming
- 📊 **TF-IDF vectorization** — converts raw text into meaningful numerical features
- 🌳 **Decision Tree classifier** — trained and evaluated on a held-out test set
- 💻 **Simple Streamlit UI** — clean, single-page web interface for real-time predictions
- 📦 **Pre-trained model included** — `model.pkl` and `vector.pkl` ready for inference, no retraining required

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Python 3.8+ |
| **NLP** | NLTK (stopwords, PorterStemmer), Regex |
| **Feature Extraction** | scikit-learn `TfidfVectorizer` |
| **Model** | scikit-learn `DecisionTreeClassifier` |
| **Web App** | Streamlit |
| **Serialization** | Pickle |

---

## 🗂️ Repository Structure

```
├── Model_Training.ipynb   # Data exploration, preprocessing, training & evaluation
├── app.py                 # Streamlit web app for real-time predictions
├── model.pkl              # Trained Decision Tree classifier
├── vector.pkl             # Fitted TF-IDF vectorizer
├── README.md               # Project documentation (this file)
```

---

## 📊 Dataset & Model Details

- **Dataset size:** 20,800 labeled news articles (`id`, `title`, `author`, `text`, `label`)
- **Label:** `0` = Reliable, `1` = Unreliable
- **Preprocessing:**
  - Removed non-alphabetic characters via regex
  - Lowercased and tokenized text
  - Removed English stopwords (NLTK)
  - Applied Porter stemming to normalize word forms
- **Feature extraction:** TF-IDF vectorization on cleaned article text
- **Train/test split:** 80% / 20%
- **Model:** Decision Tree Classifier
- **Test accuracy:** **~88.4%**

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/truthlens-ai-fake-news-detector.git
cd truthlens-ai-fake-news-detector

# Install dependencies
pip install streamlit scikit-learn nltk pandas

# Download NLTK stopwords (one-time)
python -c "import nltk; nltk.download('stopwords')"
```

### Run the App

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`. Paste in any news article text and click **Predict** to see whether it's classified as Reliable or Unreliable.

---

## 🧪 Retraining the Model

To retrain on your own dataset or experiment with different models:

1. Open `Model_Training.ipynb` in Jupyter
2. Replace `train.csv` with your labeled dataset (`text`, `label` columns required)
3. Run all cells — this regenerates `model.pkl` and `vector.pkl`
4. Restart the Streamlit app to use the updated model

---

## 📈 Future Enhancements

- [ ] Experiment with stronger models (Random Forest, XGBoost, Logistic Regression) and compare accuracy
- [ ] Add confidence/probability scores alongside predictions
- [ ] Incorporate title and author metadata as additional features
- [ ] Add a REST API endpoint (FastAPI/Flask) for programmatic access
- [ ] Deploy publicly via Streamlit Community Cloud or Docker
- [ ] Add unit tests and a CI pipeline

---

## ⚠️ Limitations

This model is trained on a specific historical news dataset and reflects the linguistic patterns present in that data. It is intended as a **learning/demo project** and should not be used as a sole source of truth for verifying real-world news — always cross-check with trusted fact-checking sources.

---

## 👤 Author
Shubham Choubey

---

## 📄 License

This project is licensed under the MIT License.
