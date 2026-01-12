// ============================================
// CONFIGURATION FILE
// ============================================
// Fill in your credentials below, then rename this file to config.js
// IMPORTANT: If making your repo public, add config.js to .gitignore
// to keep your credentials private!

// ============================================
// FIREBASE CONFIGURATION (Optional but recommended)
// ============================================
// Get these from: https://console.firebase.google.com/
// 1. Create a new project
// 2. Add a web app
// 3. Copy the config object
// 4. Paste it below

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Set to true when you've added your Firebase config
const FIREBASE_ENABLED = false;

// ============================================
// THE THINGS NETWORK (TTN) CONFIGURATION (Optional)
// ============================================
// Get these from: https://console.cloud.thethings.network/
// 1. Select your application
// 2. Go to "API keys"
// 3. Create a new API key with "Read application traffic" permission
// 4. Copy your tenant ID from the URL (e.g., "ttn" or "nam1")

const TTN_CONFIG = {
  // Your TTN tenant (usually 'nam1' for North America, or 'eu1' for Europe)
  tenant: 'nam1',
  
  // Your application ID
  applicationId: 'your-app-id',
  
  // Your API key (read-only is fine)
  apiKey: 'NNSXS.YOUR_API_KEY_HERE',
  
  // MQTT broker URL (constructed automatically)
  get brokerUrl() {
    return `wss://${this.tenant}.cloud.thethings.network:8084/mqtt`;
  },
  
  // MQTT username (constructed automatically)
  get username() {
    return `${this.applicationId}@${this.tenant}`;
  }
};

// Set to true when you've added your TTN config
const TTN_ENABLED = false;

// ============================================
// SENSOR CONFIGURATION
// ============================================
// Map your device IDs to friendly names and types
const SENSOR_MAPPINGS = {
  // Example:
  // 'device-001': {
  //   name: 'North Field Soil Moisture',
  //   type: 'soil_moisture',
  //   unit: '%',
  //   location: 'North Field',
  //   thresholds: { min: 40, max: 80 }
  // },
  // 'device-002': {
  //   name: 'Greenhouse Temperature',
  //   type: 'temperature',
  //   unit: '°F',
  //   location: 'Greenhouse 1',
  //   thresholds: { min: 60, max: 85 }
  // }
};

// ============================================
// APPLICATION SETTINGS
// ============================================
const APP_CONFIG = {
  // Your farm/location information
  farmName: 'My Farm',
  location: 'West Pasco, Washington, US',
  
  // How often to sync to Firebase (milliseconds)
  syncInterval: 300000, // 5 minutes
  
  // How often to retry failed syncs (milliseconds)
  syncRetryInterval: 60000, // 1 minute
  
  // Maximum number of chat messages to store
  maxChatHistory: 50,
  
  // Enable debug logging
  debug: true
};

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================
if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  window.FIREBASE_ENABLED = FIREBASE_ENABLED;
  window.TTN_CONFIG = TTN_CONFIG;
  window.TTN_ENABLED = TTN_ENABLED;
  window.SENSOR_MAPPINGS = SENSOR_MAPPINGS;
  window.APP_CONFIG = APP_CONFIG;
}