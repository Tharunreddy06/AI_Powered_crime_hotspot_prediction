import requests

NEWS_API_KEY = "86da195f6b1b44afa9c58b80052b78e8"

URL = "https://newsapi.org/v2/top-headlines"

def fetch_news_posts(limit=5):
    posts = []

    params = {
        "q": "crime",
        "language": "en",
        "pageSize": limit,
        "apiKey": NEWS_API_KEY
    }

    response = requests.get(URL, params=params).json()

    for article in response.get("articles", []):
        text = article["title"]
        if article.get("description"):
            text += " " + article["description"]
        posts.append({
    "text": text,
    "platform": "news"
})

    return posts
