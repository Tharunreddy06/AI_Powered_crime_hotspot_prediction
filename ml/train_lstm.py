import pandas as pd
import json
import numpy as np
import os
import joblib

from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# -----------------------------
# LOAD DATA
# -----------------------------
with open("data/l_s.json", "r") as f:
    data = json.load(f)

df = pd.DataFrame(data)

# -----------------------------
# CLEAN DATA
# -----------------------------
df.columns = df.columns.str.strip().str.lower()

df["country"] = df["country"].astype(str).str.strip().str.lower()
df["state"] = df["state"].astype(str).str.strip().str.lower()
df["crime_type"] = df["crime_type"].astype(str).str.strip().str.lower().str.replace(" ", "_")

df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce")

df = df.dropna(subset=["year", "month", "count"])

# -----------------------------
# MONTHLY AGGREGATION
# -----------------------------
grouped = df.groupby(
    ["country", "state", "crime_type", "year", "month"]
)["count"].sum().reset_index()

grouped = grouped.sort_values(
    ["country", "state", "crime_type", "year", "month"]
)

# -----------------------------
# BUILD SEQUENCES
# -----------------------------
SEQ_LEN = 3

X = []
y = []

for (country, state, crime), sub in grouped.groupby(
    ["country", "state", "crime_type"]
):

    sub = sub.sort_values(["year", "month"])

    counts = sub["count"].values

    if len(counts) <= SEQ_LEN:
        continue

    for i in range(len(counts) - SEQ_LEN):

        seq = counts[i:i+SEQ_LEN]
        target = counts[i+SEQ_LEN]

        X.append(seq)
        y.append(target)

X = np.array(X)
y = np.array(y)

# -----------------------------
# SCALE
# -----------------------------
scaler = MinMaxScaler()

X = scaler.fit_transform(X.reshape(-1, 1)).reshape(X.shape[0], X.shape[1], 1)
y = scaler.transform(y.reshape(-1, 1))

# -----------------------------
# MODEL
# -----------------------------
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, 1)),
    Dropout(0.2),
    LSTM(32),
    Dense(1)
])

model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)

# -----------------------------
# TRAIN
# -----------------------------
model.fit(
    X,
    y,
    epochs=50,
    batch_size=8,
    validation_split=0.2,
    verbose=1
)

# -----------------------------
# SAVE
# -----------------------------
os.makedirs("ml", exist_ok=True)

model.save("ml/crime_lstm_model.keras")
joblib.dump(scaler, "ml/scaler.pkl")

print("Training complete")