"""
app.py — Geetha (ML + Risk Scoring)
Flask API server for SecureMail ML service.

Endpoints:
  GET  /health   → {"status":"ok","model_loaded":true}
  POST /predict  → {risk_score, label, confidence, top_features}

Run locally:
  python app.py

Deploy (Railway uses Procfile):
  gunicorn app:app --workers 1 --timeout 120
"""

import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import load_model, predict_email, model

app = Flask(__name__)
CORS(app)

# ── Load model at startup — exit if not found ──
try:
    load_model()
except FileNotFoundError as e:
    print(f"\n❌ FATAL: {e}")
    print("Run 'python train.py' first to generate the model files.")
    sys.exit(1)


# ──────────────────────────────────────
# GET /
# ──────────────────────────────────────
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'SecureMail ML Service is running'})


# ──────────────────────────────────────
# GET /health
# Harshini's backend calls this on startup
# ──────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    from predict import model as _model
    return jsonify({
        'status':       'ok',
        'model_loaded': _model is not None
    })


# ──────────────────────────────────────
# POST /predict
# Body: { subject, body, sender }
# Returns: { risk_score, label, confidence, top_features }
# ──────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    subject = data.get('subject', '')
    body    = data.get('body', '')
    sender  = data.get('sender', '')

    if not subject and not body:
        return jsonify({'error': 'subject or body is required'}), 422

    try:
        result = predict_email(subject, body, sender)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ──────────────────────────────────────
# Run
# ──────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)