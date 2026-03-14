
from platforms.news_fetcher import fetch_news_posts
from platforms.reddit_fetcher import fetch_reddit_posts
from platforms.yt_fetcher import fetch_youtube_posts
def fetch_all_posts():
    posts = []
    posts.extend(fetch_news_posts(limit=5))
    posts.extend(fetch_reddit_posts(limit=5))
    posts.extend(fetch_youtube_posts(limit=5))
    

    return posts
