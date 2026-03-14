import praw

reddit = praw.Reddit(
    client_id="ve7EXAxWSa7w5yMS7AMRYw",
    client_secret="Dm0MMrztYiUt4P-31QXS91Ljm36Q0Q",
    user_agent="u/Fragrant-Fortune6456"
)

SUBREDDITS = [
    "india",
    "crime",
    "worldnews",
    "bangalore",
    "delhi"
]

def fetch_reddit_posts(limit=5):
    posts = []

    for sub in SUBREDDITS:
        subreddit = reddit.subreddit(sub)
        for submission in subreddit.new(limit=limit):
            text = submission.title
            if submission.selftext:
                text += " " + submission.selftext
            posts.append({
                "text": text,
                "platform": "reddit"
            })

    return posts
