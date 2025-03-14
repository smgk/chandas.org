import tweepy
import requests
import os
import time

# Twitter API credentials (replace these with actual credentials from your Twitter Developer Account)
API_KEY = "your_api_key"
API_SECRET = "your_api_secret"
ACCESS_TOKEN = "your_access_token"
ACCESS_SECRET = "your_access_secret"

# GitHub-hosted web app URL for meter analysis (Replace with your actual GitHub Pages URL)
ANALYSIS_URL = "https://your-github-username.github.io/index.html"

# Authenticate with Twitter
# This allows the bot to interact with Twitter API using the given credentials
auth = tweepy.OAuthHandler(API_KEY, API_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)
api = tweepy.API(auth, wait_on_rate_limit=True)

# Function to fetch meter analysis from the GitHub-hosted web app

def analyze_text_via_web(text):
    """
    Sends the input text to the GitHub-hosted web app for meter analysis.
    
    Args:
        text (str): The text to be analyzed for metrical patterns.
    
    Returns:
        dict: A JSON response containing meter analysis or an error message.
    """
    payload = {"text": text}
    response = requests.post(ANALYSIS_URL, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to get response from meter analysis web app"}

# Function to process tweets mentioning the bot

def process_mentions():
    """
    Fetches recent mentions of the bot on Twitter, analyzes the text, and replies with meter analysis.
    """
    mentions = api.mentions_timeline(count=5, tweet_mode='extended')
    for mention in mentions:
        tweet_id = mention.id
        user_handle = mention.user.screen_name
        tweet_text = mention.full_text.replace(f"@{api.me().screen_name}", "").strip()
        
        if tweet_text:
            print(f"Analyzing tweet from @{user_handle}: {tweet_text}")
            result = analyze_text_via_web(tweet_text)
            
            if "error" not in result:
                reply_text = (
                    f"@{user_handle} \n"
                    f"📖 Meter Analysis: {result.get('pattern', 'N/A')} \n"
                    f"📝 Script: {result.get('detectedScript', 'N/A')} \n"
                    f"📊 Syllables: {result.get('syllableCount', 'N/A')} \n"
                    f"🔢 Maatras: {result.get('maatraCount', 'N/A')}"
                )
            else:
                reply_text = f"@{user_handle} Sorry, I couldn't analyze your text. Try again later."
            
            # Reply to the tweet with analysis results
            api.update_status(reply_text, in_reply_to_status_id=tweet_id)
            print(f"Replied to @{user_handle}")

# Run bot in a loop
while True:
    """
    This loop continuously checks for new mentions every 60 seconds
    and processes them for meter analysis.
    """
    process_mentions()
    print("Waiting for new mentions...")
    time.sleep(60)  # Check for new mentions every 60 seconds