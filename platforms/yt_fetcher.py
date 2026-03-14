from googleapiclient.discovery import build

YOUTUBE_API_KEY = "AIzaSyBbb1jElhUp1zjnzQcMXBEtQRp8HnNUFVU"

youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

def fetch_youtube_posts(limit=5):
    posts = []

    request = youtube.search().list(
        q="crime news",
        part="snippet",
        maxResults=limit,
        type="video"
    )
    response = request.execute()

    for item in response["items"]:
        snippet = item["snippet"]
        text = snippet["title"]

        if snippet.get("description"):
            text += " " + snippet["description"]

        posts.append({
            "text": text,
            "platform": "youtube"
        })

    return posts
