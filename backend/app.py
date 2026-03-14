import sys
import os
import json
import joblib
import pandas as pd
import numpy as np

from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

sys.path.append(PROJECT_ROOT)

from ml.shap_explainer import get_shap_values

app = Flask(__name__)
CORS(app)

# -----------------------------
# PATHS
# -----------------------------
MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "crime_lstm_model.keras")
SCALER_PATH = os.path.join(PROJECT_ROOT, "ml", "scaler.pkl")

HISTORIC_PATH = os.path.join(PROJECT_ROOT, "data", "l_s.json")
REALTIME_PATH = os.path.join(PROJECT_ROOT, "data", "crime_dataset.json")

# -----------------------------
# LOAD MODEL
# -----------------------------
print("Loading model...")
model = load_model(MODEL_PATH, compile=False)
scaler = joblib.load(SCALER_PATH)
print("Model loaded successfully")

# -----------------------------
# LOAD DATA
# -----------------------------
crime_data = []

if os.path.exists(HISTORIC_PATH):
    with open(HISTORIC_PATH, "r", encoding="utf-8") as f:
        crime_data.extend(json.load(f))

if os.path.exists(REALTIME_PATH):
    with open(REALTIME_PATH, "r", encoding="utf-8") as f:
        crime_data.extend(json.load(f))

print("Total records loaded:", len(crime_data))

# -----------------------------
# PREDICTION LOGIC
# -----------------------------
def predict_crime_percentage_logic(country, state):

    filtered = []

    for d in crime_data:
        if (
            str(d.get("country", "")).strip().lower() == country.strip().lower()
            and str(d.get("state", "")).strip().lower() == state.strip().lower()
        ):
            try:
                filtered.append({
                    "year": int(d["year"]),
                    "month": int(d["month"]),
                    "crime_type": str(d["crime_type"]).lower().replace(" ", "_"),
                    "count": int(d["count"])
                })
            except:
                continue

    if len(filtered) == 0:
        return 0, None

    df = pd.DataFrame(filtered)

    grouped = df.groupby(
        ["crime_type", "year", "month"]
    )["count"].sum().reset_index()

    grouped = grouped.sort_values(["crime_type", "year", "month"])

    predictions = []
    last_seq_for_shap = None
    best_recent_total = -1

    for crime in grouped["crime_type"].unique():

        sub = grouped[grouped["crime_type"] == crime]

        if len(sub) < 3:
            continue

        counts = sub["count"].values.reshape(-1, 1)

        scaled = scaler.transform(counts)

        last_seq = scaled[-3:]
        seq = last_seq.reshape(1, 3, 1)

        pred_scaled = model.predict(seq, verbose=0)[0][0]
        pred = scaler.inverse_transform([[pred_scaled]])[0][0]

        predictions.append(pred)

        recent_total = sub["count"].tail(3).sum()

        if recent_total > best_recent_total:
            best_recent_total = recent_total
            last_seq_for_shap = seq

    if len(predictions) == 0:
        return 0, None

    predicted_total = np.sum(predictions)

    monthly_total_avg = grouped.groupby(
        ["year", "month"]
    )["count"].sum().mean()

    if monthly_total_avg == 0:
        percent = 0
    else:
        ratio = predicted_total / monthly_total_avg
        percent = 50 + ((ratio - 1) * 50)

    percent = max(min(percent, 99), 1)

    return round(percent, 2), last_seq_for_shap

# -----------------------------
# PREDICT API
# -----------------------------
@app.route("/predict-crime", methods=["POST"])
def predict_crime():

    data = request.get_json(force=True)

    country = data.get("country", "")
    state = data.get("state", "")

    prediction, last_seq = predict_crime_percentage_logic(country, state)

    shap_values = {}
    explanation_text = []

    if last_seq is not None:
        try:
            shap_values, explanation_text = get_shap_values(last_seq)
        except Exception as e:
            print("SHAP error:", e)

    return jsonify({
        "prediction": prediction,
        "shap_values": shap_values,
        "explanation_text": explanation_text
    })

# -----------------------------
# HOTSPOTS API
# -----------------------------
@app.route("/hotspots/<country>", methods=["GET"])
def hotspots(country):

    states = set()

    for d in crime_data:

        c = str(d.get("country", "")).strip().lower()
        s = str(d.get("state", "")).strip()

        if c == country.strip().lower():
            if s and s.lower() != "null" and not s.isdigit():
                states.add(s)

    results = []

    for state in states:
        try:
            score, _ = predict_crime_percentage_logic(country, state)

            if score > 0:
                results.append({
                    "state": state,
                    "score": score
                })
        except:
            continue

    results = sorted(
        results,
        key=lambda x: x["score"],
        reverse=True
    )[:3]

    return jsonify(results)

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(host="0.0.0.0", port=5000, debug=True)

