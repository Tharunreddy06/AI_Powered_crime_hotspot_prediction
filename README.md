# AI-Powered Crime Hotspot Prediction Using Real-Time Social Media Data

## Overview

AI-Powered Crime Hotspot Prediction Using Real-Time Social Media Data is a full-stack intelligent crime analytics system that combines **historical crime records** and **real-time social media/news signals** to identify potential crime hotspots.

The project uses **Natural Language Processing (NLP)** to extract locations and crime-related information from live text posts, converts them into geographic coordinates, predicts future hotspot intensity using deep learning, and visualizes results on an interactive map dashboard.

---

## Key Features

* Real-time post collection from News, Reddit, and YouTube
* Historical + real-time data fusion
* Multilingual location extraction using mBERT
* Crime classification using rule-based logic
* Date extraction from text
* Geocoding using GeoPy
* Crime hotspot prediction using LSTM
* Explainable AI using SHAP
* Interactive country/state crime visualization using Leaflet.js
* Crime domain filtering
* Hotspot detection and prediction dashboard

---

## Project Architecture

```text
Platform APIs
   ↓
news_fetcher.py / reddit_fetcher.py / yt_fetcher.py
   ↓
platform_manager.py
   ↓
web_api.py
   ↓
NLP Processing
   ↓
mBERT → Location Extraction
Crime Classifier → Crime Category
Date Extractor → Date Detection
GeoPy → Coordinates
   ↓
Structured Crime Dataset
   ↓
LSTM Prediction Model
   ↓
SHAP Explainability
   ↓
Frontend Dashboard (Leaflet.js)
```

---

## Folder Structure

```text
ai_crime/
│
├── backend/
│   ├── app.py
│   ├── web_api.py
│
├── css/
│   ├── style.css
│
├── js/
│   ├── countryMap.js
│   ├── dataProcessor.js
│   ├── domains.js
│   ├── map.js
│   ├── place.js
│
├── data/
│   ├── final.json
│   ├── l_s.json
│   ├── crime_dataset.json
│   ├── crime_data.json
│   ├── places_to_visit.json
│   ├── safety_rules.json
│   ├── world.geo.json
│   ├── indiageo.json
│   ├── usageo.json
│   ├── canadageo.json
│   ├── australiageo.json
│   ├── germanygeo.json
│   ├── japangeo.json
│   ├── brazilgeo.json
│   ├── southafricageo.json
│
├── ml/
│   ├── train_lstm.py
│   ├── crime_lstm_model.keras
│   ├── scaler.pkl
│   ├── shap_explainer.py
│   ├── mbert_loader.py
│
├── platforms/
│   ├── news_fetcher.py
│   ├── reddit_fetcher.py
│   ├── yt_fetcher.py
│   ├── platform_manager.py
│
├── utils/
│   ├── extractor.py
│   ├── datetime_extractor.py
│   ├── geocoder.py
│   ├── crime_classifier.py
│
├── index.html
├── country.html
├── map.html
├── place.html
```

---

## Technologies Used

### Frontend

* HTML
* CSS
* JavaScript
* Leaflet.js

### Backend

* Flask
* FastAPI
* Python

### Machine Learning / NLP

* mBERT (Multilingual BERT)
* LSTM (Long Short-Term Memory)
* SHAP (Explainable AI)

### Supporting Libraries

* Transformers
* GeoPy
* TensorFlow / Keras
* Pandas
* NumPy

---

## Models Used

### 1. mBERT

Used for multilingual Named Entity Recognition to extract location names from text posts.

### 2. LSTM

Used for sequential crime trend learning and future hotspot prediction.

### 3. SHAP

Used to explain why a particular hotspot prediction was generated.

---

## Data Sources

### Real-Time Data

* News API
* Reddit API
* YouTube API

### Historical Data

* Synthetic crime datasets stored in JSON format

---

## How It Works

1. Fetch live posts from external platforms
2. Extract location using mBERT
3. Detect crime type using rule-based classifier
4. Extract date information
5. Convert location into latitude/longitude
6. Merge with historical data
7. Predict hotspot probability using LSTM
8. Explain prediction using SHAP
9. Display results on interactive map

---

## Running the Project

### Install Dependencies

```bash
pip install flask fastapi transformers geopy tensorflow pandas numpy shap uvicorn
```

---

### Run Backend

```bash
cd backend
python app.py
```

---

### Run Real-Time API

```bash
python web_api.py
```

---

### Open Frontend

Open:

```text
index.html
```

in browser

---

## Future Enhancements

* Live deployment
* More countries support
* Sentiment analysis integration
* Better domain-specific prediction tuning
* Automatic hotspot alert notifications

---

## Project Team

* Thurupu Tharun
* Vemula Yaswanth Kumar
* Pathan Mohammed Akram Khan
* Chintala Rishi Sudeep

---

## Mentor

Prof. Radha R

---
