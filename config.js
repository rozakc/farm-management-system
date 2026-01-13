// Default configuration - copy config.example.js and customize
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCrags5oVCuNuWBzN0lDFofkviInoaM14s",
  authDomain: "farm-app-373c2.firebaseapp.com",
  databaseURL: "https://farm-app-373c2-default-rtdb.firebaseio.com",
  projectId: "farm-app-373c2",
  storageBucket: "farm-app-373c2.firebasestorage.app",
  messagingSenderId: "409316310884",
  appId: "1:409316310884:web:8ec88b5b1b5a4953114471",
  measurementId: "G-4NVVV4JRTD"
};
const FIREBASE_ENABLED = true;
const TTN_CONFIG = {
  tenant: 'nam1',
  applicationId: 'rozafarm',
  apiKey: 'NNSXS.4AEY55F45DWRI44J6TH7AAPXIYQXGYJREMQKKCY.QL54P5FQIPLJQACSWE26ONWMSZFFOP7AGWIERFU7B754WUQZ636A',
  get brokerUrl() {
    return `wss://${this.tenant}.cloud.thethings.network:8084/mqtt`;
  },
  get username() {
    return `${this.applicationId}@${this.tenant}`;
  }
};
const TTN_ENABLED = true;
const SENSOR_MAPPINGS = {
  'roza-node-1': {
    name: 'Motion Sensor - Location 1',  // Update these!
    type: 'motion',
    unit: '',
    location: 'Area 1',
    thresholds: { min: 0, max: 1 }
  },
  'roza-node-2': {
    name: 'Motion Sensor - Location 2',
    type: 'motion',
    unit: '',
    location: 'Area 2',
    thresholds: { min: 0, max: 1 }
  },
  'roza-node-3': {
    name: 'Motion Sensor - Location 3',
    type: 'motion',
    unit: '',
    location: 'Area 3',
    thresholds: { min: 0, max: 1 }
  }
};
const APP_CONFIG = {
  farmName: 'My Farm',
  location: 'West Pasco, Washington, US',
  syncInterval: 300000,
  syncRetryInterval: 60000,
  maxChatHistory: 50,
  debug: true
};

if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  window.FIREBASE_ENABLED = FIREBASE_ENABLED;
  window.TTN_CONFIG = TTN_CONFIG;
  window.TTN_ENABLED = TTN_ENABLED;
  window.SENSOR_MAPPINGS = SENSOR_MAPPINGS;
  window.APP_CONFIG = APP_CONFIG;
}