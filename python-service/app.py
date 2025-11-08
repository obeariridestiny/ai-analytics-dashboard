from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import joblib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize models
isolation_forest = IsolationForest(contamination=0.1, random_state=42)
linear_model = LinearRegression()

# Store recent data for training
recent_data = []
model_trained = False

def train_models():
    """Train ML models with recent data"""
    global model_trained
    
    if len(recent_data) < 10:
        return False
    
    # Prepare data for training
    X = np.array(recent_data).reshape(-1, 1)
    
    # Train anomaly detection model
    isolation_forest.fit(X)
    
    # Train prediction model
    y = np.array(recent_data)
    X_seq = np.arange(len(y)).reshape(-1, 1)
    linear_model.fit(X_seq, y)
    
    model_trained = True
    return True

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'data_points': len(recent_data),
        'model_trained': model_trained,
        'service': 'AI Analytics Python Service'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make predictions based on historical data"""
    try:
        data = request.json.get('data', [])
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Add new data to recent data
        recent_data.extend(data)
        if len(recent_data) > 100:
            recent_data = recent_data[-100:]
        
        # Train models if we have enough data
        train_models()
        
        if not model_trained:
            # Return simple average if model not trained
            prediction = np.mean(data) if data else 0
            return jsonify({
                'prediction': float(prediction),
                'confidence': 0.5,
                'model_used': 'average',
                'message': 'Using simple average (not enough data for AI model)'
            })
        
        # Make prediction
        X_pred = np.array([len(recent_data)]).reshape(-1, 1)
        prediction = linear_model.predict(X_pred)[0]
        
        # Calculate confidence based on data variance
        confidence = max(0.1, 1 - (np.std(recent_data) / (np.mean(recent_data) + 1e-8)) * 0.5)
        
        return jsonify({
            'prediction': float(prediction),
            'confidence': float(confidence),
            'model_used': 'linear_regression',
            'data_points_used': len(recent_data),
            'message': 'AI prediction successful'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in the provided data"""
    try:
        data = request.json.get('data', [])
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if len(data) < 5:
            return jsonify({
                'anomalies': [],
                'message': 'Insufficient data for anomaly detection'
            })
        
        # Add new data to recent data
        recent_data.extend(data)
        if len(recent_data) > 100:
            recent_data = recent_data[-100:]
        
        # Train models if we have enough data
        train_models()
        
        if not model_trained:
            # Simple z-score based anomaly detection
            data_array = np.array(data)
            mean = np.mean(data_array)
            std = np.std(data_array)
            
            if std == 0:
                anomalies = []
            else:
                z_scores = np.abs((data_array - mean) / std)
                anomalies = [i for i, z in enumerate(z_scores) if z > 2.5]
            
            return jsonify({
                'anomalies': anomalies,
                'method': 'z_score',
                'threshold': 2.5,
                'total_data_points': len(data),
                'anomaly_count': len(anomalies)
            })
        
        # Use Isolation Forest for anomaly detection
        X = np.array(data).reshape(-1, 1)
        predictions = isolation_forest.predict(X)
        anomalies = [i for i, pred in enumerate(predictions) if pred == -1]
        
        return jsonify({
            'anomalies': anomalies,
            'method': 'isolation_forest',
            'total_data_points': len(data),
            'anomaly_count': len(anomalies),
            'message': 'AI anomaly detection completed'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/statistics', methods=['POST'])
def calculate_statistics():
    """Calculate basic statistics for the data"""
    try:
        data = request.json.get('data', [])
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        data_array = np.array(data)
        
        stats = {
            'mean': float(np.mean(data_array)),
            'median': float(np.median(data_array)),
            'std_dev': float(np.std(data_array)),
            'min': float(np.min(data_array)),
            'max': float(np.max(data_array)),
            'q1': float(np.percentile(data_array, 25)),
            'q3': float(np.percentile(data_array, 75)),
            'count': len(data_array)
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)