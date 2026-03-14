from ml.mbert_loader import ner_pipeline

def extract_place(text):
    try:
        entities = ner_pipeline(text)
    except Exception as e:
        print("NER error:", e)
        return None

    locations = [
        ent["word"]
        for ent in entities
        if ent["entity_group"] == "LOC"
    ]

    return locations[0] if locations else None
