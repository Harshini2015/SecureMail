import joblib
import numpy as np
import os
from feature_engineering import extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'phishing_model.joblib')

# Load model once at startup
model = None

def load_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully")
    return model

def predict_phishing(subject: str, body: str) -> dict:
    """
    Predict whether an email is phishing.
    Returns: { risk_score (0-100), confidence (0-1), is_phishing (bool) }
    """
    clf = load_model()
    features = extract_features(subject, body)

    # Get probability of phishing (class 1)
    proba = clf.predict_proba(features)[0]
    phishing_confidence = float(proba[1])

    # Convert confidence to risk score (0-100)
    risk_score = int(phishing_confidence * 100)

    return {
        'risk_score': risk_score,
        'confidence': round(phishing_confidence, 4),
        'is_phishing': phishing_confidence >= 0.5
    }