# 🚀 Setting Up the Twitter Bot on Synology NAS

## ✅ Step 1: Enable SSH Access on Synology NAS
1. **Log in to DSM (Synology Web UI)**.
2. **Go to Control Panel** → **Terminal & SNMP**.
3. **Enable SSH service** and note the NAS IP address.

---

## ✅ Step 2: Connect to Your NAS via SSH
1. Open **Terminal (Mac/Linux)** or **PuTTY (Windows)**.
2. Run:
   ```sh
   ssh your-nas-username@your-nas-ip
   ```
3. Enter your **password** when prompted.

---

## ✅ Step 3: Install Python on Synology NAS
Check if Python is installed:
```sh
python3 --version
```
- If it outputs `Python 3.x.x`, you're good!
- If not, install **Python 3** via **Package Center** in DSM.

---

## ✅ Step 4: Install Dependencies
1. Create a directory for the bot:
   ```sh
   mkdir -p ~/twitter-bot && cd ~/twitter-bot
   ```
2. **Transfer the bot script to the NAS** using **SCP** (from your local machine):
   ```sh
   scp twitter_bot.py your-nas-username@your-nas-ip:~/twitter-bot/
   ```
3. **Install required Python libraries**:
   ```sh
   python3 -m pip install tweepy requests
   ```

---

## ✅ Step 5: Run the Bot
1. Navigate to the bot directory:
   ```sh
   cd ~/twitter-bot
   ```
2. Start the bot:
   ```sh
   python3 twitter_bot.py
   ```
3. If it works correctly, you should see:
   ```sh
   Waiting for new mentions...
   ```
   - Mention your Twitter bot and check if it replies!

---

## ✅ Step 6: Keep the Bot Running in the Background
To ensure the bot **runs continuously** even when you close SSH:

1. **Use `nohup` (No Hangup) to run the bot in the background:**
   ```sh
   nohup python3 twitter_bot.py > bot.log 2>&1 &
   ```
   - This keeps the bot running even after you log out.
   - Logs are saved to `bot.log`.

2. **Verify it’s running:**
   ```sh
   ps aux | grep twitter_bot.py
   ```
   - If running, you’ll see a **process ID (PID)**.

3. **Stop the bot when needed:**
   ```sh
   kill $(pgrep -f twitter_bot.py)
   ```

---

## ✅ Step 7: Set Up Automatic Restarts (Optional)
If you want the bot to **restart automatically on NAS reboot**, add a cron job:
1. Open crontab:
   ```sh
   crontab -e
   ```
2. Add this line at the end:
   ```sh
   @reboot nohup python3 ~/twitter-bot/twitter_bot.py > ~/twitter-bot/bot.log 2>&1 &
   ```
3. Save and exit. This will **start the bot automatically** when the NAS reboots.

---

## 🚀 Next Steps
- **Test the bot** by mentioning it on Twitter.
- **Check `bot.log`** for debugging if issues arise.
- **Monitor the bot** using `ps aux | grep twitter_bot.py`.

Need any modifications? Let me know! 🚀