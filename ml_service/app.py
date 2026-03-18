from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_phishing, load_model

app = Flask(__name__)
CORS(app)

# Load model at startup
try:
    load_model()
except FileNotFoundError as e:
    print(f"⚠️ Warning: {e}")

@app.route('/', methods=['GET'])
def home():
    return jsonify({ 'message': 'SecureMail ML Service is running' })

@app.route('/health', methods=['GET'])
def health():
    from predict import model
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data:
        return jsonify({ 'error': 'No JSON body provided' }), 400

    subject = data.get('subject', '')
    body = data.get('body', '')

    if not subject and not body:
        return jsonify({ 'error': 'subject or body required' }), 422

    try:
        result = predict_phishing(subject, body)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({ 'error': str(e) }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)