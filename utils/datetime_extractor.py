import re
from datetime import datetime

def extract_date(text):
    today = datetime.today()

    date = today.day
    month = today.month
    year = today.year

    match = re.search(r"\d{1,2}[-/]\d{1,2}[-/]\d{4}", text)
    if match:
        try:
            parsed = datetime.strptime(match.group(), "%d-%m-%Y")
            date, month, year = parsed.day, parsed.month, parsed.year
        except:
            pass

    return date, month, year
