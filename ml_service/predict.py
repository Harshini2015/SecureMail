"""
predict.py — Geetha (ML + Risk Scoring)
Loads model once at startup.
Maps incoming email (subject, body, sender) → 8 numeric features → prediction.

Response format (checklist exact):
  { risk_score: float 0-1, label: "phishing"|"legitimate",
    confidence: float, top_features: [...] }
"""

import os
import re
import joblib
import numpy as np

# ── Paths ──
MODEL_DIR  = os.path.join(os.path.dirname(__file__), 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'phishing_model.joblib')
COLS_PATH  = os.path.join(MODEL_DIR, 'feature_cols.joblib')

# ── Globals ──
model        = None
feature_cols = None

# Urgent keywords used in training dataset
URGENT_KEYWORDS = [
    'urgent', 'verify', 'suspended', 'click here',
    'act now', 'confirm', 'limited', 'immediately',
    'expires', 'action required', 'account closed',
    'within 24 hours', 'reset now', 'login now'
]


def load_model():
    """Load model from disk. Called once at Flask startup."""
    global model, feature_cols

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}\nRun: python train.py"
        )
    if not os.path.exists(COLS_PATH):
        raise FileNotFoundError(
            f"Feature cols not found at {COLS_PATH}\nRun: python train.py"
        )

    model        = joblib.load(MODEL_PATH)
    feature_cols = joblib.load(COLS_PATH)
    print("✅ Model loaded successfully")


def _extract_numeric_features(subject: str, body: str, sender: str) -> np.ndarray:
    """
    Convert raw email text → same 8 numeric features the dataset uses.
    This is how predict.py bridges the gap between raw email input
    and the trained numeric model.
    """
    text = f"{subject} {body} {sender}"
    words = text.split()

    # num_words
    num_words = len(words)

    # num_unique_words
    num_unique_words = len(set(w.lower() for w in words))

    # num_stopwords (common English stopwords)
    STOPWORDS = {
        'the','a','an','and','or','but','in','on','at','to','for',
        'of','with','by','from','is','was','are','were','be','been',
        'have','has','had','do','does','did','will','would','could',
        'should','may','might','i','you','he','she','it','we','they',
        'this','that','these','those','my','your','his','her','our'
    }
    num_stopwords = sum(1 for w in words if w.lower() in STOPWORDS)

    # num_links
    num_links = len(re.findall(r'https?://', text))

    # num_unique_domains
    domains = re.findall(r'https?://([^/\s]+)', text)
    num_unique_domains = len(set(domains))

    # num_email_addresses
    num_email_addresses = len(re.findall(
        r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text
    ))

    # num_spelling_errors (approximation: words with 3+ consecutive consonants)
    consonants = set('bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ')
    def looks_misspelled(w):
        streak = 0
        for ch in w:
            if ch in consonants:
                streak += 1
                if streak >= 4:
                    return True
            else:
                streak = 0
        return False
    num_spelling_errors = sum(1 for w in words if looks_misspelled(w))

    # num_urgent_keywords
    text_lower = text.lower()
    num_urgent_keywords = sum(1 for kw in URGENT_KEYWORDS if kw in text_lower)

    return np.array([[
        num_words,
        num_unique_words,
        num_stopwords,
        num_links,
        num_unique_domains,
        num_email_addresses,
        num_spelling_errors,
        num_urgent_keywords,
    ]])


def predict_email(subject: str, body: str, sender: str = '') -> dict:
    """
    Predict whether an email is phishing.

    Returns:
        {
          risk_score:   float 0.0-1.0,
          label:        "phishing" | "legitimate",
          confidence:   float 0.0-1.0,
          top_features: list of {name, value}
        }
    """
    global model
    if model is None:
        load_model()

    # Build numeric feature vector
    X = _extract_numeric_features(subject, body, sender)

    # Predict
    proba         = model.predict_proba(X)[0]
    phishing_prob = float(proba[1])

    risk_score = round(phishing_prob, 4)
    label      = "phishing" if phishing_prob >= 0.5 else "legitimate"
    confidence = round(float(max(proba)), 4)

    # Top features — which ones are non-zero and most relevant
    feat_names  = feature_cols if feature_cols else [
        'num_words','num_unique_words','num_stopwords','num_links',
        'num_unique_domains','num_email_addresses',
        'num_spelling_errors','num_urgent_keywords'
    ]
    feat_values = X[0].tolist()
    top_features = [
        {"name": name, "value": round(val, 4)}
        for name, val in zip(feat_names, feat_values)
        if val > 0
    ]
    top_features = sorted(top_features, key=lambda x: x['value'], reverse=True)[:5]

    return {
        "risk_score":   risk_score,
        "label":        label,
        "confidence":   confidence,
        "top_features": top_features
    }