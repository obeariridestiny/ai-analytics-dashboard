from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import random
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Simple ML models
isolation_forest = IsolationForest(contamination=0.1, random_state=42)
linear_model = LinearRegression()
recent_data = []

@app.route('/')
def home():
    return jsonify({
        "message": "🤖 AI Analytics Python Service",
        "status": "active",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "detect_anomalies": "/detect-anomalies (POST)",
            "statistics": "/statistics (POST)"
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "AI Analytics Python Service",
        "timestamp": datetime.now().isoformat(),
        "model_ready": len(recent_data) >= 5
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json.get('data', [])
        
        if not data:
            return jsonify({
                "prediction": round(random.uniform(50, 100), 2),
                "confidence": 0.7,
                "model_used": "random_fallback",
                "message": "No data provided, using random prediction"
            })
        
        # Add to recent data for training
        recent_data.extend(data)
        if len(recent_data) > 50:
            recent_data = recent_data[-50:]
        
        # Simple prediction logic
        if len(recent_data) >= 10:
            # Train simple linear model
            X = np.arange(len(recent_data)).reshape(-1, 1)
            y = np.array(recent_data)
            linear_model.fit(X, y)
            
            # Predict next value
            next_index = len(recent_data)
            prediction = linear_model.predict([[next_index]])[0]
            confidence = max(0.6, 1 - (np.std(recent_data) / 100))
            
            return jsonify({
                "prediction": round(float(prediction), 2),
                "confidence": round(float(confidence), 2),
                "model_used": "linear_regression",
                "data_points": len(recent_data),
                "message": "AI prediction successful"
            })
        else:
            # Simple average prediction
            avg = np.mean(data)
            prediction = avg + random.uniform(-10, 10)
            
            return jsonify({
                "prediction": round(float(prediction), 2),
                "confidence": 0.8,
                "model_used": "weighted_average",
                "message": "Using weighted average (more data needed for AI)"
            })
            
    except Exception as e:
        return jsonify({
            "prediction": round(random.uniform(50, 100), 2),
            "confidence": 0.5,
            "model_used": "error_fallback",
            "error": str(e)
        }), 500

@app.route('/detect-anomalies', methods=['POST'])
def detect_anomalies():
    try:
        data = request.json.get('data', [])
        
        if len(data) < 5:
            return jsonify({
                "anomalies": [],
                "total_points": len(data),
                "anomaly_count": 0,
                "method": "insufficient_data",
                "message": "Need at least 5 data points for anomaly detection"
            })
        
        # Simple anomaly detection
        data_array = np.array(data)
        mean = np.mean(data_array)
        std = np.std(data_array)
        
        if std == 0:
            anomalies = []
        else:
            # Use z-score method
            z_scores = np.abs((data_array - mean) / std)
            anomalies = [int(i) for i, z in enumerate(z_scores) if z > 2.0]
        
        # Add to recent data for ML training
        recent_data.extend(data)
        if len(recent_data) > 50:
            recent_data = recent_data[-50:]
        
        # Train Isolation Forest if we have enough data
        if len(recent_data) >= 10:
            X = np.array(recent_data).reshape(-1, 1)
            isolation_forest.fit(X)
            ml_anomalies = isolation_forest.predict(X[-len(data):])
            ml_anomaly_indices = [i for i, pred in enumerate(ml_anomalies) if pred == -1]
            
            # Combine both methods
            all_anomalies = list(set(anomalies + ml_anomaly_indices))
            
            return jsonify({
                "anomalies": all_anomalies,
                "total_points": len(data),
                "anomaly_count": len(all_anomalies),
                "method": "combined_zscore_isolationforest",
                "message": "AI anomaly detection completed"
            })
        
        return jsonify({
            "anomalies": anomalies,
            "total_points": len(data),
            "anomaly_count": len(anomalies),
            "method": "z_score",
            "threshold": 2.0,
            "message": "Statistical anomaly detection completed"
        })
        
    except Exception as e:
        return jsonify({
            "anomalies": [],
            "anomaly_count": 0,
            "method": "error_fallback",
            "error": str(e)
        }), 500

@app.route('/statistics', methods=['POST'])
def statistics():
    try:
        data = request.json.get('data', [])
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        data_array = np.array(data)
        
        stats = {
            "mean": round(float(np.mean(data_array)), 2),
            "median": round(float(np.median(data_array)), 2),
            "std_dev": round(float(np.std(data_array)), 2),
            "min": round(float(np.min(data_array)), 2),
            "max": round(float(np.max(data_array)), 2),
            "q1": round(float(np.percentile(data_array, 25)), 2),
            "q3": round(float(np.percentile(data_array, 75)), 2),
            "count": len(data_array),
            "sum": round(float(np.sum(data_array)), 2)
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)