import json
import os

DATASET_PATH = "data/crime_dataset.json"

COLUMNS = [
    "platform",
    "country", "state", "city",
    "latitude", "longitude",
    "date", "month", "year",
    "crime_type", "count", "case_solved"
]

def initialize_dataset():
    """
    Create an empty JSON dataset if it does not exist
    """
    if not os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, "w") as f:
            json.dump([], f, indent=2)


def append_data(data):
    """
    Append a single record to the JSON dataset
    """

    # Ensure all columns exist (like DataFrame columns)
    record = {col: data.get(col, None) for col in COLUMNS}

    # Load existing dataset
    with open(DATASET_PATH, "r") as f:
        dataset = json.load(f)

    # Append new row
    dataset.append(record)

    # Save back to file
    with open(DATASET_PATH, "w") as f:
        json.dump(dataset, f, indent=2)
