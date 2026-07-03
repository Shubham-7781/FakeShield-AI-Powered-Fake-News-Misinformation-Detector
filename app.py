"""
==========================================================
TruthLens AI
Professional Fake News Detection Dashboard

Developed by : Shubham Choubey
==========================================================
"""

# ==========================================================
# IMPORTS
# ==========================================================

import os
import re
import pickle
from datetime import datetime

import nltk
import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# ==========================================================
# PAGE CONFIGURATION
# ==========================================================

st.set_page_config(
    page_title="TruthLens AI",
    page_icon="📰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================================
# DOWNLOAD NLTK
# ==========================================================

try:
    stopwords.words("english")
except LookupError:
    nltk.download("stopwords")

# ==========================================================
# LOAD MODEL
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
VECTOR_PATH = os.path.join(BASE_DIR, "vector.pkl")

model = pickle.load(open(MODEL_PATH, "rb"))
vectorizer = pickle.load(open(VECTOR_PATH, "rb"))

# ==========================================================
# NLP
# ==========================================================

stemmer = PorterStemmer()

STOP_WORDS = set(stopwords.words("english"))

# ==========================================================
# PREPROCESSING
# ==========================================================

def preprocess(text):

    text = str(text)

    text = re.sub(r"[^a-zA-Z]", " ", text)

    text = text.lower()

    words = text.split()

    words = [
        stemmer.stem(word)
        for word in words
        if word not in STOP_WORDS
    ]

    cleaned = " ".join(words)

    return cleaned


# ==========================================================
# PREDICTION
# ==========================================================

def predict(news):

    cleaned = preprocess(news)

    vector = vectorizer.transform([cleaned])

    prediction = model.predict(vector)[0]

    probability = model.predict_proba(vector)[0]

    confidence = float(max(probability) * 100)

    return prediction, confidence, probability, cleaned


# ==========================================================
# SESSION STATE
# ==========================================================

if "history" not in st.session_state:
    st.session_state.history = []

# ==========================================================
# CUSTOM CSS
# ==========================================================

st.markdown("""
<style>

html, body, [class*="css"]{
    font-family: 'Segoe UI';
}

.main{
    background:#0F172A;
}

.block-container{
    padding-top:1rem;
    padding-bottom:2rem;
}

.title{

    text-align:center;

    font-size:52px;

    font-weight:bold;

    color:#38BDF8;

}

.subtitle{

    text-align:center;

    color:#CBD5E1;

    font-size:18px;

    margin-bottom:20px;

}

.card{

    background:#1E293B;

    padding:18px;

    border-radius:15px;

    border:1px solid #334155;

    box-shadow:0px 5px 20px rgba(0,0,0,0.2);

}

.real{

    background:#14532D;

    color:white;

    padding:20px;

    border-radius:15px;

    text-align:center;

    font-size:30px;

    font-weight:bold;

}

.fake{

    background:#7F1D1D;

    color:white;

    padding:20px;

    border-radius:15px;

    text-align:center;

    font-size:30px;

    font-weight:bold;

}

.footer{

    text-align:center;

    color:gray;

    margin-top:50px;

}

</style>
""", unsafe_allow_html=True)
# ==========================================================
# SIDEBAR
# ==========================================================

with st.sidebar:

    st.markdown("# 📰 TruthLens AI")

    st.caption("AI Powered Fake News Detection")

    st.divider()

    st.subheader("🤖 Model")

    st.success("Logistic Regression")

    st.subheader("📊 Vectorizer")

    st.info("TF-IDF")

    st.subheader("📚 Dataset")

    st.write("Reuters Fake & Real News")

    st.metric(
        "Articles",
        "44,898"
    )

    st.metric(
        "Features",
        "5,000"
    )

    st.metric(
        "Accuracy",
        "98.49%"
    )

    st.divider()

    st.subheader("📌 Instructions")

    st.write("""
1. Paste a news article.

2. Click **Analyze News**.

3. View prediction and confidence.

4. Compare processed text.

5. Download history if required.
""")

    st.divider()

    st.success("✅ System Ready")

# ==========================================================
# PAGE HEADER
# ==========================================================

st.markdown(
"""
<div class='title'>
TruthLens AI
</div>

<div class='subtitle'>
Professional Fake News Detection using Machine Learning
</div>
""",
unsafe_allow_html=True
)

st.divider()

# ==========================================================
# TOP DASHBOARD
# ==========================================================

c1,c2,c3,c4 = st.columns(4)

with c1:

    st.metric(
        "Accuracy",
        "98.49%"
    )

with c2:

    st.metric(
        "Dataset",
        "44,898"
    )

with c3:

    st.metric(
        "Algorithm",
        "Logistic Regression"
    )

with c4:

    st.metric(
        "Language",
        "English"
    )

st.divider()

# ==========================================================
# NEWS INPUT
# ==========================================================

st.subheader("📝 Enter News Article")

news = st.text_area(

    "",

    height=260,

    placeholder="""
Paste any complete news article here...

Example:

WASHINGTON (Reuters) - The Federal Reserve announced that...
"""
)

col1,col2,col3 = st.columns(3)

predict_btn = col1.button(

    "🔍 Analyze News",

    use_container_width=True

)

example_real = col2.button(

    "✅ Real Example",

    use_container_width=True

)

example_fake = col3.button(

    "❌ Fake Example",

    use_container_width=True

)

if example_real:

    news = """
WASHINGTON (Reuters) - The Federal Reserve announced
that it will continue monitoring inflation before making
changes to interest rates. Officials stated that the
economy remains stable while employment continues to improve.
"""

if example_fake:

    news = """
Scientists officially confirmed that drinking hot salt water
every morning cures every disease within three days.
Governments around the world are hiding this miracle
treatment from the public.
"""

# ==========================================================
# ANALYSIS
# ==========================================================

if predict_btn:

    if news.strip()=="":

        st.warning("Please enter a news article.")

        st.stop()

    prediction,confidence,probability,processed = predict(news)

    real_prob = probability[0]*100

    fake_prob = probability[1]*100

    st.divider()

    left,right = st.columns([2,1])

    with left:

        if prediction==0:

            st.markdown(
            """
            <div class='real'>
            ✅ REAL NEWS
            </div>
            """,
            unsafe_allow_html=True
            )

        else:

            st.markdown(
            """
            <div class='fake'>
            ❌ FAKE NEWS
            </div>
            """,
            unsafe_allow_html=True
            )

    with right:

        st.metric(

            "Confidence",

            f"{confidence:.2f}%"

        )

    st.progress(confidence/100)

    st.divider()
        # ==========================================================
    # PROBABILITY CHART
    # ==========================================================

    st.subheader("📊 Prediction Probability")

    prob_df = pd.DataFrame({
        "Category": ["Real News", "Fake News"],
        "Probability": [real_prob, fake_prob]
    })

    fig = px.bar(
        prob_df,
        x="Category",
        y="Probability",
        text="Probability",
        color="Category",
        title="Prediction Confidence",
    )

    fig.update_traces(
        texttemplate="%{text:.2f}%",
        textposition="outside"
    )

    fig.update_layout(
        height=420,
        xaxis_title="Prediction",
        yaxis_title="Confidence (%)",
        showlegend=False
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )

    st.divider()

    # ==========================================================
    # TEXT STATISTICS
    # ==========================================================

    st.subheader("📈 News Statistics")

    col1,col2,col3,col4 = st.columns(4)

    characters = len(news)

    words = len(news.split())

    processed_words = len(processed.split())

    sentences = len(
        [x for x in news.split(".") if x.strip()]
    )

    col1.metric(
        "Characters",
        characters
    )

    col2.metric(
        "Words",
        words
    )

    col3.metric(
        "Processed Words",
        processed_words
    )

    col4.metric(
        "Sentences",
        sentences
    )

    st.divider()

    # ==========================================================
    # ORIGINAL VS CLEANED
    # ==========================================================

    st.subheader("📝 Text Preprocessing")

    left,right = st.columns(2)

    with left:

        st.markdown("### 📰 Original News")

        st.text_area(
            "",
            news,
            height=300,
            disabled=True,
            key="original_news"
        )

    with right:

        st.markdown("### ⚙ Processed Text")

        st.text_area(
            "",
            processed,
            height=300,
            disabled=True,
            key="processed_news"
        )

    st.divider()

    # ==========================================================
    # SAVE HISTORY
    # ==========================================================

    st.session_state.history.append({

        "Time": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),

        "Prediction":
            "Real"
            if prediction==0
            else "Fake",

        "Confidence":
            round(confidence,2),

        "Characters":
            characters,

        "Words":
            words

    })
        # ==========================================================
    # PREDICTION HISTORY
    # ==========================================================

st.markdown("---")
st.header("📚 Prediction History")

if len(st.session_state.history) > 0:

    history_df = pd.DataFrame(st.session_state.history)

    st.dataframe(
        history_df,
        use_container_width=True,
        hide_index=True
    )

    csv = history_df.to_csv(index=False).encode("utf-8")

    st.download_button(
        label="📥 Download Prediction History",
        data=csv,
        file_name="TruthLens_AI_History.csv",
        mime="text/csv",
        use_container_width=True
    )

else:

    st.info("No prediction history available.")

# ==========================================================
# MODEL PERFORMANCE
# ==========================================================

st.markdown("---")
st.header("📈 Model Performance")

metric1,metric2,metric3,metric4 = st.columns(4)

metric1.metric(
    "Accuracy",
    "98.49%"
)

metric2.metric(
    "Precision",
    "98.37%"
)

metric3.metric(
    "Recall",
    "98.61%"
)

metric4.metric(
    "F1 Score",
    "98.49%"
)

st.progress(0.9849)

# ==========================================================
# MODEL INFORMATION
# ==========================================================

st.markdown("---")
st.header("🤖 Model Information")

left,right = st.columns(2)

with left:

    st.success("""
### Machine Learning Model

• Logistic Regression

• TF-IDF Vectorizer

• Binary Classification

• English NLP

• Porter Stemmer

• Stopword Removal
""")

with right:

    st.info("""
### Dataset

• Fake.csv

• True.csv

• Total Articles : 44,898

• Features : 5000

• Classes : 2

• Language : English
""")

# ==========================================================
# TECHNOLOGY STACK
# ==========================================================

st.markdown("---")
st.header("🛠 Technology Stack")

c1,c2,c3 = st.columns(3)

with c1:

    st.success("""
### Backend

✔ Python

✔ Pandas

✔ NumPy

✔ Regex
""")

with c2:

    st.success("""
### Machine Learning

✔ Scikit-Learn

✔ Logistic Regression

✔ TF-IDF

✔ NLTK
""")

with c3:

    st.success("""
### Frontend

✔ Streamlit

✔ Plotly

✔ Pickle

✔ CSS
""")

# ==========================================================
# HOW THE MODEL WORKS
# ==========================================================

st.markdown("---")
st.header("⚙ Workflow")

st.markdown("""

### Step 1
User enters a news article.

↓

### Step 2
The text is cleaned:

- Remove punctuation
- Convert to lowercase
- Remove stopwords
- Apply Porter Stemming

↓

### Step 3
TF-IDF converts text into numerical vectors.

↓

### Step 4
Logistic Regression predicts:

- ✅ Real News
- ❌ Fake News

↓

### Step 5
Confidence score and probability are displayed.
""")
# ==========================================================
# PROJECT DASHBOARD
# ==========================================================

st.markdown("---")
st.header("📊 TruthLens AI Dashboard")

col1, col2 = st.columns(2)

with col1:

    st.subheader("Prediction Distribution")

    history = st.session_state.history

    if len(history) > 0:

        real_count = sum(
            1 for i in history
            if i["Prediction"] == "Real"
        )

        fake_count = sum(
            1 for i in history
            if i["Prediction"] == "Fake"
        )

        pie_df = pd.DataFrame({

            "Category":[
                "Real News",
                "Fake News"
            ],

            "Count":[
                real_count,
                fake_count
            ]

        })

        fig = px.pie(

            pie_df,

            values="Count",

            names="Category",

            hole=0.45,

            title="Prediction History Distribution"

        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )

    else:

        st.info("No prediction history available.")

with col2:

    st.subheader("Project Summary")

    st.metric(
        "Total Predictions",
        len(st.session_state.history)
    )

    st.metric(
        "Model",
        "Logistic Regression"
    )

    st.metric(
        "Dataset",
        "44,898 Articles"
    )

    st.metric(
        "Vectorizer",
        "TF-IDF"
    )

# ==========================================================
# FEATURE HIGHLIGHTS
# ==========================================================

st.markdown("---")
st.header("🚀 Features")

feature1, feature2 = st.columns(2)

with feature1:

    st.success("""
### AI Features

✅ Fake News Detection

✅ Real News Detection

✅ Confidence Score

✅ TF-IDF Vectorization

✅ Logistic Regression

✅ NLP Preprocessing

✅ Stopword Removal

✅ Porter Stemming
""")

with feature2:

    st.success("""
### Dashboard Features

✅ Prediction History

✅ CSV Export

✅ Interactive Charts

✅ Text Statistics

✅ Original vs Processed Text

✅ Responsive Layout

✅ Professional UI

✅ Session Tracking
""")

# ==========================================================
# ABOUT PROJECT
# ==========================================================

st.markdown("---")

st.header("📖 About TruthLens AI")

st.write("""

TruthLens AI is a Machine Learning based Fake News Detection
System developed using **Python**, **Scikit-Learn** and
**Streamlit**.

The application preprocesses news articles using
Natural Language Processing techniques such as:

• Text Cleaning

• Lowercasing

• Stopword Removal

• Porter Stemming

The processed text is converted into numerical vectors
using **TF-IDF Vectorization**.

Finally, a **Logistic Regression** model predicts
whether the article is **Real** or **Fake** while
displaying prediction confidence.

""")

# ==========================================================
# DEVELOPER
# ==========================================================

st.markdown("---")

st.header("👨‍💻 Developer")

st.info("""

**Shubham Choubey**

Machine Learning Enthusiast

Data Analytics

Deep Learning

Generative AI

Python | SQL | Power BI | Machine Learning

""")
# ==========================================================
# APP STATISTICS
# ==========================================================

st.markdown("---")

st.header("📊 Live Application Statistics")

col1, col2, col3, col4 = st.columns(4)

total_predictions = len(st.session_state.history)

real_predictions = sum(
    1 for x in st.session_state.history
    if x["Prediction"] == "Real"
)

fake_predictions = sum(
    1 for x in st.session_state.history
    if x["Prediction"] == "Fake"
)

avg_confidence = 0

if total_predictions > 0:

    avg_confidence = round(
        sum(x["Confidence"] for x in st.session_state.history)
        / total_predictions,
        2
    )

col1.metric(
    "Total Predictions",
    total_predictions
)

col2.metric(
    "Real News",
    real_predictions
)

col3.metric(
    "Fake News",
    fake_predictions
)

col4.metric(
    "Average Confidence",
    f"{avg_confidence}%"
)

# ==========================================================
# DISCLAIMER
# ==========================================================

st.markdown("---")

st.warning("""
### ⚠ Disclaimer

TruthLens AI is an educational Machine Learning project.

Predictions are generated based on patterns learned from
historical training data and should not be considered a
replacement for professional fact-checking.

Always verify important news from trusted sources.
""")

# ==========================================================
# PROJECT DETAILS
# ==========================================================

st.markdown("---")

with st.expander("📁 Project Details", expanded=False):

    st.write("""
### Project Name

TruthLens AI

### Version

2.0

### Framework

Streamlit

### Machine Learning

Logistic Regression

### NLP

NLTK

### Vectorization

TF-IDF

### Dataset

Fake.csv + True.csv

### Total Dataset Size

44,898 News Articles
""")

# ==========================================================
# FOOTER
# ==========================================================

st.markdown("---")

st.markdown(
"""
<div style='text-align:center;
padding:20px;
border-radius:10px;
background:#0f172a;
border:1px solid #334155;'>

<h2 style='color:#38bdf8;margin-bottom:5px;'>

📰 TruthLens AI

</h2>

<p style='color:#cbd5e1;'>

Professional Fake News Detection using Machine Learning

</p>

<hr>

<p style='color:gray;'>

Developed by <b>Shubham Choubey</b>

</p>

<p style='color:gray;'>

Python • Scikit-Learn • Streamlit • NLP • TF-IDF

</p>

<p style='color:#38bdf8;'>

Version 2.0 | 2026

</p>

</div>
""",
unsafe_allow_html=True
)

# ==========================================================
# END OF APP
# ==========================================================