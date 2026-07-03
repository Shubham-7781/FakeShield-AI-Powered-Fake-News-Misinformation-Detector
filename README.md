# 📰 TruthLens AI

<div align="center">

### AI-Powered Fake News Detection System

Detect whether a news article is **Real** or **Fake** using **Machine Learning**, **Natural Language Processing**, and an interactive **Streamlit** dashboard.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML-orange)
![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-red)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 📌 Overview

TruthLens AI is a machine learning application that classifies news articles as **Real** or **Fake**.

The project uses Natural Language Processing (NLP) techniques to clean and transform text into numerical features using **TF-IDF**, followed by a **Logistic Regression** classifier for prediction.

The application provides a modern Streamlit dashboard with confidence scores, prediction history, and interactive visualizations.

---

# ✨ Features

- 📰 Fake News Detection
- 🤖 Logistic Regression Model
- 🔤 TF-IDF Vectorization
- 🧹 Automatic Text Preprocessing
- 📊 Prediction Confidence
- 📈 Interactive Charts (Plotly)
- 📚 Prediction History
- 📥 Export Prediction History (CSV)
- 🌙 Modern Dashboard UI
- ⚡ Fast Predictions

---

# 🏗 Project Structure

TruthLens-AI/
│
├── app.py
├── train_model.py
├── model.pkl
├── vector.pkl
├── requirements.txt
├── README.md
│
├── dataset/
│ ├── Fake.csv
│ └── True.csv


---

# ⚙ Technologies Used

- Python
- Streamlit
- Scikit-Learn
- Pandas
- NumPy
- NLTK
- Plotly
- Matplotlib

---

# 🧠 Machine Learning Pipeline

1. Load Dataset
2. Text Cleaning
3. Lowercase Conversion
4. Stopword Removal
5. TF-IDF Vectorization
6. Logistic Regression Training
7. Model Evaluation
8. Save Model
9. Predict News

---

# 📊 Dataset

The project uses the **Fake and Real News Dataset** consisting of:

| Dataset | Articles |
|----------|---------:|
| Fake News | 23,481 |
| Real News | 21,417 |
| **Total** | **44,898** |

---

# 📈 Model Performance

| Metric | Score |
|---------|-------|
| Accuracy | **98.49%** |
| Precision | **98.37%** |
| Recall | **98.61%** |
| F1 Score | **98.49%** |

---
👨‍💻 Developer

Shubham Choubey

Machine Learning
Data Analytics
Deep Learning
Generative AI
Technical Skills
Python
SQL
Power BI
Machine Learning
Data Visualization

⭐ If you like this project

Please consider giving the repository a ⭐ on GitHub.

📜 License

This project is licensed under the MIT License.
