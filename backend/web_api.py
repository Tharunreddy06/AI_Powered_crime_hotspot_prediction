from fastapi import FastAPI
from platforms.platform_manager import fetch_all_posts
from utils.extractor import extract_place
from utils.crime_classifier import classify_crime
from utils.datetime_extractor import extract_date
from utils.geocoder import get_lat_lon
from data_pipeline.dataset_manager import initialize_dataset, append_data

app = FastAPI()

initialize_dataset()

def process_text(item):
    text = item["text"]
    platform = item["platform"]

    place = extract_place(text)
    crime_type = classify_crime(text)
    date, month, year = extract_date(text)
    country, state, city, lat, lon = get_lat_lon(place)

    data = {
        "platform": platform,
        "country": country,
        "state": state,
        "city": city,
        "latitude": lat,
        "longitude": lon,
        "date": date,
        "month": month,
        "year": year,
        "crime_type": crime_type,
        "count": 1,
        "case_solved": 0
    }

    append_data(data)

@app.post("/refresh-data")
def refresh_data():
    posts = fetch_all_posts()

    for post in posts:
        process_text(post)

    return {
        "status": "success",
        "message": f"{len(posts)} new posts processed and dataset updated"
    }
