from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'AI Analytics Python Service'
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json.get('data', [50, 60, 70])
    avg = sum(data) / len(data) if data else 60
    prediction = avg + random.uniform(-10, 10)
    
    return jsonify({
        'prediction': round(prediction, 2),
        'confidence': round(random.uniform(0.7, 0.95), 2)
    })

@app.route('/detect-anomalies', methods=['POST'])
def detect_anomalies():
    data = request.json.get('data', [])
    anomalies = [i for i in range(len(data)) if random.random() < 0.1]
    
    return jsonify({
        'anomalies': anomalies,
        'total_points': len(data)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)