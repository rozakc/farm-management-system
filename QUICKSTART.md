# Quick Setup Guide

Get your Farm Command Center running in 5 minutes!

## Step 1: Get the Code on GitHub

### If you already have the files locally:

```bash
# Navigate to your farm-command-center folder
cd farm-command-center

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial Farm Command Center setup"

# Create repo on GitHub (do this in browser first)
# Then connect:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### If you're starting from scratch:

1. Download all the files I created
2. Put them in a folder called `farm-command-center`
3. Follow the steps above

## Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings**
3. Scroll down to **Pages** (in left sidebar)
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Step 3: Test It Out

1. Visit your GitHub Pages URL
2. You should see the Farm Command Center!
3. Try adding a task, note, or knowledge entry
4. Data saves to your browser's LocalStorage automatically

**You're done!** The app works now with LocalStorage.

## Step 4 (Optional): Add Cloud Sync with Firebase

### Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "my-farm-data")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Setup Realtime Database

1. In left sidebar: **Build** → **Realtime Database**
2. Click "Create Database"
3. Choose location (closest to you)
4. Start in **test mode** (we'll secure later)
5. Click "Enable"

### Get Your Config

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll to "Your apps"
4. Click the web icon `</>`
5. Register app (name: "Farm App")
6. Copy the `firebaseConfig` object

### Update Your Config

1. Open `config.js` on your computer
2. Replace the `FIREBASE_CONFIG` with your values:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIza...",  // Your actual values here
  authDomain: "my-farm-data.firebaseapp.com",
  databaseURL: "https://my-farm-data-default-rtdb.firebaseio.com",
  projectId: "my-farm-data",
  storageBucket: "my-farm-data.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const FIREBASE_ENABLED = true;  // Change to true!
```

3. Save the file
4. **Important**: Make sure `.gitignore` includes `config.js`
5. Push changes:

```bash
git add config.js
git commit -m "Enable Firebase sync"
git push
```

6. Wait 1-2 minutes for GitHub Pages to update
7. Refresh your site - you should see "Cloud Sync Active" in the header!

## Step 5 (Optional): Add TTN Sensors

### Get TTN Credentials

1. Go to [console.cloud.thethings.network](https://console.cloud.thethings.network/)
2. Select your application
3. Click **API keys** (left sidebar)
4. Click **+ Add API key**
5. Name: "Farm Dashboard"
6. Rights: Check "Read application traffic (uplink and downlink)"
7. Click **Create API key**
8. **Copy the key immediately** (you can't see it again!)

### Update Config

```javascript
const TTN_CONFIG = {
  tenant: 'nam1',  // or 'eu1', etc. based on your region
  applicationId: 'my-farm-sensors',  // Your TTN app ID
  apiKey: 'NNSXS.YOUR_ACTUAL_API_KEY_HERE',
};

const TTN_ENABLED = true;  // Change to true!
```

### Add Sensor Mappings

```javascript
const SENSOR_MAPPINGS = {
  'soil-sensor-01': {
    name: 'North Field Soil Moisture',
    type: 'soil_moisture',
    unit: '%',
    location: 'North Field',
    thresholds: { min: 40, max: 80 }
  },
  'temp-sensor-greenhouse': {
    name: 'Greenhouse Temperature',
    type: 'temperature',
    unit: '°F',
    location: 'Greenhouse 1',
    thresholds: { min: 60, max: 85 }
  }
};
```

Replace `'soil-sensor-01'` with your actual TTN device IDs.

### Test

1. Push changes to GitHub
2. Wait for Pages to update
3. Check your dashboard - you should see sensor cards!
4. Send a test message from your LoRaWAN device
5. Watch it appear in real-time!

## Troubleshooting

### "Site not loading"
- Wait 2-3 minutes after enabling Pages
- Check Settings → Pages for the URL
- Make sure index.html is in root folder

### "Cloud Sync not working"
- Check browser console (F12) for errors
- Verify `FIREBASE_ENABLED = true`
- Make sure Realtime Database is created
- Test mode should be enabled initially

### "Sensors not connecting"
- Verify `TTN_ENABLED = true`
- Check API key has correct permissions
- Confirm device IDs match SENSOR_MAPPINGS
- Check browser console for connection errors

### "Lost my config.js"
- Copy `config.example.js` to `config.js`
- Re-enter your credentials
- It's in .gitignore so won't be pushed to GitHub

## Next Steps

- **Secure Firebase**: Add authentication
- **Add AI**: Set up Cloud Functions for AI assistant
- **Customize**: Edit styles.css for your branding
- **Add Features**: Modify app.js for custom workflows

## Need Help?

1. Check the full README.md
2. Look at browser console (F12)
3. Open GitHub issue
4. Check TTN/Firebase documentation

---

**Happy farming!** 🌾🚜