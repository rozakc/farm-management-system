// ============================================
// SENSORS MODULE
// Handles TTN/LoRaWAN sensor integration
// ============================================

const Sensors = {
  // MQTT client
  client: null,
  
  // Sensor data storage
  sensorData: {},
  
  // Connection state
  connected: false,
  
  // Initialize sensor system
  init() {
    if (!window.TTN_ENABLED || !window.TTN_CONFIG.apiKey) {
      console.log('📡 TTN integration disabled');
      this.updateStatus('disabled');
      return;
    }
    
    // Check TTN toggle
    const ttnToggle = document.getElementById('ttnToggle');
    if (ttnToggle) {
      ttnToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.connect();
        } else {
          this.disconnect();
        }
      });
      
      // Auto-connect if enabled
      if (ttnToggle.checked) {
        this.connect();
      }
    }
    
    // Load cached sensor data
    this.loadCachedData();
  },
  
  // Connect to TTN MQTT broker
  connect() {
    if (!window.TTN_CONFIG.apiKey || this.connected) return;
    
    try {
      console.log('📡 Connecting to TTN MQTT broker...');
      this.updateStatus('connecting');
      
      // TTN WebSocket MQTT endpoint - port 8884 for WSS
      const wsUrl = `wss://${window.TTN_CONFIG.tenant}.cloud.thethings.network:8884/mqtt`;
      
      // Create MQTT client
      this.client = mqtt.connect(wsUrl, {
        username: window.TTN_CONFIG.username,
        password: window.TTN_CONFIG.apiKey,
        reconnectPeriod: 5000,
        connectTimeout: 30000
      });
      
      // Connection established
      this.client.on('connect', () => {
        console.log('✅ Connected to TTN');
        this.connected = true;
        this.updateStatus('connected');
        
        // Subscribe to all devices
        const topic = `v3/${window.TTN_CONFIG.applicationId}@${window.TTN_CONFIG.tenant}/devices/+/up`;
        this.client.subscribe(topic, (err) => {
          if (err) {
            console.error('Subscription failed:', err);
          } else {
            console.log(`📡 Subscribed to: ${topic}`);
          }
        });
      });
      
      // Message received
      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
      
      // Connection error
      this.client.on('error', (error) => {
        console.error('MQTT error:', error);
        this.updateStatus('error');
      });
      
      // Connection closed
      this.client.on('close', () => {
        console.log('📡 TTN connection closed');
        this.connected = false;
        this.updateStatus('disconnected');
      });
      
    } catch (error) {
      console.error('Failed to connect to TTN:', error);
      this.updateStatus('error');
    }
  },
  
  // Disconnect from TTN
  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
      this.updateStatus('disconnected');
      console.log('📡 Disconnected from TTN');
    }
  },
  
  // Handle incoming MQTT message
  handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      
      // Extract device info
      const deviceId = data.end_device_ids?.device_id;
      if (!deviceId) return;
      
      // Get decoded payload
      const payload = data.uplink_message?.decoded_payload;
      if (!payload) return;
      
      // Update sensor data
      this.updateSensorData(deviceId, payload, data.received_at);
      
      console.log(`📊 Sensor data received from ${deviceId}:`, payload);
      
    } catch (error) {
      console.error('Failed to process sensor message:', error);
    }
  },
  
  // Update sensor data and UI
  updateSensorData(deviceId, payload, timestamp) {
    // Get sensor mapping
    const mapping = window.SENSOR_MAPPINGS[deviceId] || {
      name: deviceId,
      type: 'unknown',
      location: 'Unknown'
    };
    
    // Store sensor data
    this.sensorData[deviceId] = {
      ...mapping,
      deviceId,
      payload,
      timestamp,
      lastUpdate: new Date(timestamp)
    };
    
    // Cache to localStorage
    this.cacheData();
    
    // Update UI
    this.renderSensorDashboard();
  },
  
  // Render sensor dashboard
  renderSensorDashboard() {
    const container = document.getElementById('sensorDashboard');
    if (!container) return;
    
    const sensors = Object.values(this.sensorData);
    
    if (sensors.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          ${this.connected ? 'Waiting for sensor data...' : 'Connect to TTN to see sensor data'}
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="sensor-grid">
        ${sensors.map(sensor => this.renderSensorCard(sensor)).join('')}
      </div>
    `;
  },
  
  // Render individual sensor card
  renderSensorCard(sensor) {
    const { deviceId, name, payload, lastUpdate, type, unit, thresholds } = sensor;
    
    // Determine primary value to display
    let value, displayUnit;
    if (type === 'motion') {
      // Motion sensor - display trigger count
      value = payload.trigger_count || payload.digital_pb14 || 0;
      displayUnit = 'triggers';
    } else if (type === 'soil_moisture') {
      value = payload.moisture || payload.humidity || payload.value || 0;
      displayUnit = unit || '%';
    } else if (type === 'temperature') {
      value = payload.temperature || payload.temp || payload.value || 0;
      displayUnit = unit || '°F';
    } else {
      // Generic display - show first numeric value
      const numericKey = Object.keys(payload).find(k => typeof payload[k] === 'number');
      value = numericKey ? payload[numericKey] : 0;
      displayUnit = unit || '';
    }
    
    // Check thresholds
    let status = 'good';
    let statusClass = 'good';
    
    if (type === 'motion') {
      // Motion sensor status based on trigger count and time
      const motionDetected = payload.pir_triggered || payload.motion === 'detected';
      if (motionDetected) {
        status = 'Motion Detected 🚨';
        statusClass = 'alert';
      } else {
        status = 'No Motion ✓';
        statusClass = 'good';
      }
    } else if (thresholds) {
      if (value < thresholds.min) {
        status = 'Low ⚠️';
        statusClass = 'alert';
      } else if (value > thresholds.max) {
        status = 'High ⚠️';
        statusClass = 'alert';
      } else {
        status = 'Good ✓';
      }
    }
    
    // Calculate percentage for bar
    let percentage;
    if (type === 'motion') {
      // For motion, show 100% if motion detected, 0% otherwise
      percentage = (payload.pir_triggered || payload.motion === 'detected') ? 100 : 0;
    } else if (thresholds) {
      percentage = Math.min(100, Math.max(0, ((value - thresholds.min) / (thresholds.max - thresholds.min)) * 100));
    } else {
      percentage = 50;
    }
    
    // Time since last update
    const timeDiff = Date.now() - new Date(lastUpdate).getTime();
    const minutesAgo = Math.floor(timeDiff / 60000);
    const timeAgo = minutesAgo < 1 ? 'Just now' : 
                    minutesAgo === 1 ? '1 minute ago' : 
                    minutesAgo < 60 ? `${minutesAgo} minutes ago` :
                    `${Math.floor(minutesAgo / 60)} hours ago`;
    
    const isOnline = minutesAgo < 30;
    
    return `
      <div class="sensor-card ${statusClass}">
        <div class="sensor-header">
          <div class="sensor-name">${name}</div>
          <div class="sensor-status ${isOnline ? 'online' : 'offline'}">
            ${isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        
        <div class="sensor-value">
          ${value.toFixed(1)}<span class="sensor-unit">${displayUnit}</span>
        </div>
        
        <div class="sensor-bar">
          <div class="sensor-bar-fill ${statusClass}" style="width: ${percentage}%"></div>
        </div>
        
        <div class="sensor-meta">
          <span>Status: ${status}</span>
          <span>${timeAgo}</span>
        </div>
        
        ${Object.keys(payload).length > 1 ? `
          <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--earth-medium);">
            ${Object.entries(payload).filter(([k, v]) => typeof v === 'number').map(([k, v]) => 
              `<div>${k}: ${v}${unit || ''}</div>`
            ).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // Cache sensor data to localStorage
  cacheData() {
    localStorage.setItem('sensor-cache', JSON.stringify(this.sensorData));
  },
  
  // Load cached sensor data
  loadCachedData() {
    const cached = localStorage.getItem('sensor-cache');
    if (cached) {
      try {
        this.sensorData = JSON.parse(cached);
        this.renderSensorDashboard();
        console.log('📊 Loaded cached sensor data');
      } catch (error) {
        console.error('Failed to load cached sensor data:', error);
      }
    }
  },
  
  // Update status UI
  updateStatus(status) {
    const statusEl = document.getElementById('ttnStatus');
    if (!statusEl) return;
    
    const statusText = {
      'disabled': 'Disabled',
      'connecting': 'Connecting...',
      'connected': 'Connected ✓',
      'disconnected': 'Disconnected',
      'error': 'Error ✗'
    };
    
    statusEl.textContent = statusText[status] || status;
  },
  
  // Get current sensor readings for AI
  getSensorContext() {
    const sensors = Object.values(this.sensorData);
    
    if (sensors.length === 0) {
      return 'No sensor data available.';
    }
    
    const sensorText = sensors.map(sensor => {
      const { name, payload, lastUpdate } = sensor;
      const timeAgo = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 60000);
      const payloadStr = Object.entries(payload)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      
      return `- ${name}: ${payloadStr} (${timeAgo} minutes ago)`;
    }).join('\n');
    
    return `SENSOR READINGS:\n${sensorText}`;
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Sensors = Sensors;
}