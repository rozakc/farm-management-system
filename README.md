# 🌾 Farm Command Center

An intelligent farm management system with IoT sensor integration, persistent data storage, and AI assistance.

## Features

- **📊 Dashboard** - Track completed tasks, upcoming tasks, notes, and knowledge base
- **📡 IoT Sensors** - Real-time LoRaWAN sensor data via The Things Network (TTN)
- **🤖 AI Assistant** - Query your farm data and get insights (requires backend setup)
- **💾 Dual Storage** - LocalStorage for instant access + Firebase for cloud sync
- **📥 Export/Import** - Backup and restore your data as JSON files
- **🌦️ Weather Integration** - Ready for weather API integration

## Quick Start

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/farm-command-center.git
cd farm-command-center
```

### 2. Configure (Optional but Recommended)

Copy the example config file:
```bash
cp config.example.js config.js
```

Edit `config.js` and add your credentials:
- Firebase config (for cloud sync)
- The Things Network credentials (for sensor data)
- Sensor mappings

### 3. Deploy to GitHub Pages

#### Option A: Quick Deploy (Public Repo)

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/farm-command-center.git
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to "Pages"
   - Source: "main" branch, "/ (root)" folder
   - Save

4. Your site will be live at: `https://yourusername.github.io/farm-command-center/`

#### Option B: Private Repo (Keep Credentials Secret)

1. Add `config.js` to `.gitignore` (already included)
2. Store sensitive configs in GitHub Secrets
3. Use GitHub Actions to inject configs during build (advanced)

### 4. Local Development

Simply open `index.html` in your browser. No build process needed!

## Configuration Guide

### Firebase Setup (Cloud Sync)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app
4. Enable Realtime Database:
   - Go to "Build" → "Realtime Database"
   - Click "Create Database"
   - Choose location
   - Start in "test mode" (you can secure later)
5. Copy the config object to `config.js`
6. Set `FIREBASE_ENABLED = true`

**Security Rules** (optional but recommended):
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### The Things Network Setup (IoT Sensors)

1. Go to [The Things Network Console](https://console.cloud.thethings.network/)
2. Select your application
3. Create API Key:
   - Go to "API keys"
   - Add API key
   - Rights: "Read application traffic"
   - Copy the key
4. Add to `config.js`:
   - `tenant`: Usually `nam1` (North America) or `eu1` (Europe)
   - `applicationId`: Your TTN application ID
   - `apiKey`: The API key you just created
5. Configure sensor mappings:
   ```javascript
   SENSOR_MAPPINGS: {
     'my-device-001': {
       name: 'North Field Soil Moisture',
       type: 'soil_moisture',
       unit: '%',
       location: 'North Field',
       thresholds: { min: 40, max: 80 }
     }
   }
   ```
6. Set `TTN_ENABLED = true`

### AI Assistant Setup

The AI assistant requires a backend to protect your API keys. Here are your options:

#### Option 1: Firebase Cloud Functions (Recommended)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize functions: `firebase init functions`
3. Create a function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const Anthropic = require('@anthropic-ai/sdk');

exports.farmAssistant = functions.https.onCall(async (data, context) => {
  const anthropic = new Anthropic({
    apiKey: functions.config().anthropic.key
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: data.prompt }]
  });

  return { response: message.content[0].text };
});
```

4. Set API key: `firebase functions:config:set anthropic.key="YOUR_API_KEY"`
5. Deploy: `firebase deploy --only functions`
6. Update `app.js` to call your function

#### Option 2: Netlify Functions

1. Create `netlify/functions/chat.js`:
```javascript
const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body);
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }]
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ response: message.content[0].text })
  };
};
```

2. Add API key to Netlify environment variables
3. Deploy to Netlify

#### Option 3: Vercel Edge Functions

Similar to Netlify, but using Vercel's platform.

## Usage

### Managing Tasks

- **Completed Tasks**: Log what you've done with dates
- **Upcoming Tasks**: Track what needs to be done
- Both sync across devices if Firebase is enabled

### Knowledge Base

This is the brain of your AI assistant. Add information like:
- Crop rotation schedules
- Irrigation practices
- Equipment maintenance logs
- Historical yields
- Soil composition
- Pest management strategies

The AI assistant uses this knowledge to answer questions and provide recommendations.

### Sensor Dashboard

Once TTN is configured, you'll see real-time data from your LoRaWAN sensors:
- Soil moisture
- Temperature
- Humidity
- Custom sensor data

Sensors show:
- Current readings
- Time since last update
- Status indicators (good/low/high)
- Visual progress bars

### Data Management

**Export**: Download all your data as JSON
**Import**: Restore from a backup file
**Sync**: Manually sync to Firebase cloud

## File Structure

```
farm-command-center/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js              # Main application logic
├── storage.js          # LocalStorage + Firebase sync
├── sensors.js          # TTN/LoRaWAN integration
├── config.js           # Your credentials (gitignored)
├── config.example.js   # Template for credentials
├── README.md           # This file
└── .gitignore          # Keeps secrets safe
```

## Storage Architecture

### LocalStorage (Primary)
- Instant read/write
- Works offline
- Device-specific
- ~5-10MB limit

### Firebase (Backup/Sync)
- Cloud storage
- Cross-device sync
- Automatic backups
- Configurable sync interval

### JSON Export (Manual Backup)
- Full data export
- Store anywhere (Dropbox, USB, etc.)
- Import to new device
- Version control your farm data

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

Requires:
- localStorage support
- WebSocket support (for TTN)
- Modern JavaScript (ES6+)

## Security Notes

### Public GitHub Repo
If your repository is public:
- ✅ `config.js` is in `.gitignore` (safe)
- ✅ Never commit API keys
- ⚠️ Anyone can use your HTML/CSS/JS (that's ok!)

### Private Data
- Farm data stays in YOUR browser (LocalStorage)
- Firebase data is yours (your account)
- TTN credentials are read-only (low risk)

### API Keys
- Never expose Claude API keys in frontend
- Use Firebase/Netlify/Vercel functions
- Keep `config.js` out of git

## Troubleshooting

### Firebase Not Syncing
- Check `FIREBASE_ENABLED = true` in config.js
- Verify Firebase config is correct
- Check browser console for errors
- Ensure Realtime Database is enabled

### TTN Not Connecting
- Verify `TTN_ENABLED = true`
- Check API key permissions
- Confirm tenant (nam1, eu1, etc.)
- Test devices are transmitting

### AI Not Responding
- AI requires backend setup (see Configuration Guide)
- Check backend function logs
- Verify API key is valid
- Test backend endpoint separately

### Data Not Saving
- Check browser console
- Verify localStorage isn't disabled
- Try export/import as backup

## Customization

### Adding Sensor Types

Edit `sensors.js` to support new sensor types:

```javascript
renderSensorCard(sensor) {
  // Add your custom sensor logic
  if (type === 'my_custom_sensor') {
    value = payload.myValue;
    displayUnit = 'units';
  }
}
```

### Styling

Edit `styles.css` - all styles use CSS variables for easy theming:

```css
:root {
  --earth-dark: #2c3e2e;
  --clay: #c8956d;
  /* etc */
}
```

### Adding Features

The modular structure makes it easy to add features:
- `app.js` - Add UI features
- `storage.js` - Add storage methods
- `sensors.js` - Add sensor integrations

## Contributing

This is your farm management system! Feel free to:
- Fork and modify
- Add features
- Customize for your needs
- Share improvements

## License

MIT License - Use freely for your farm!

## Support

For issues:
1. Check browser console for errors
2. Review configuration
3. Test with example config
4. Open GitHub issue with details

## Roadmap

Potential future features:
- [ ] Weather API integration
- [ ] Mobile app (PWA)
- [ ] Multi-user support
- [ ] Advanced analytics
- [ ] Report generation
- [ ] Photo attachments
- [ ] Geolocation tagging
- [ ] Offline-first architecture

---

Built with ❤️ for farmers who code (or code for farmers who farm!)
"# farm-mangement-system" 
