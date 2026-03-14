import shap
import numpy as np
import os
from tensorflow.keras.models import load_model

# -----------------------------
# PATH SETUP
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "crime_lstm_model.keras")

# -----------------------------
# LOAD MODEL
# -----------------------------
model = load_model(MODEL_PATH, compile=False)

# -----------------------------
# MODEL WRAPPER
# -----------------------------
def model_wrapper(x):
    x = np.array(x)
    x = x.reshape(-1, 3, 1)
    return model.predict(x, verbose=0)

# -----------------------------
# BACKGROUND DATA
# -----------------------------
background = np.array([
    [0, 0, 0],
    [0.2, 0.2, 0.2],
    [0.5, 0.5, 0.5],
    [1, 1, 1]
])

explainer = shap.KernelExplainer(model_wrapper, background)

# -----------------------------
# SHAP FUNCTION
# -----------------------------
def get_shap_values(last_seq):

    flat = last_seq.reshape(1, 3)

    shap_vals = explainer.shap_values(flat)

    # Fully flatten safely
    shap_array = np.array(shap_vals).flatten()

    feature_names = [
        "3 months ago",
        "2 months ago",
        "Last month"
    ]

    shap_dict = {}
    explanation = []

    # Ensure exactly 3 values
    if len(shap_array) < 3:
        shap_array = np.pad(shap_array, (0, 3 - len(shap_array)))

    for i in range(3):

        val = float(shap_array[i])

        shap_dict[feature_names[i]] = val

        if val > 0:
            explanation.append(
                f"{feature_names[i]} increased crime trend"
            )
        else:
            explanation.append(
                f"{feature_names[i]} reduced crime trend"
            )

    return shap_dict, explanation