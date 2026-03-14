def classify_crime(text):
    text = text.lower()

    if any(k in text for k in ["rape", "sexual", "harassment", "assault"]):
        return "sexual_offense"
    elif any(k in text for k in ["theft", "robbery", "stolen", "burglary"]):
        return "theft"
    elif any(k in text for k in ["hack", "fraud", "cyber", "scam"]):
        return "cybercrime"
    elif any(k in text for k in ["political", "riot", "election", "protest"]):
        return "political_related"
    elif any(k in text for k in ["murder", "attack", "violence", "killed"]):
        return "violence"
    else:
        return "others"
