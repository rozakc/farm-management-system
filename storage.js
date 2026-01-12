// ============================================
// STORAGE MODULE
// Handles LocalStorage + Firebase sync
// ============================================

const Storage = {
  // Firebase database reference
  db: null,
  
  // Sync state
  syncEnabled: true,
  lastSyncTime: null,
  pendingSyncs: new Set(),
  
  // Initialize storage system
  async init() {
    // Initialize Firebase if enabled
    if (window.FIREBASE_ENABLED && window.FIREBASE_CONFIG.apiKey) {
      try {
        firebase.initializeApp(window.FIREBASE_CONFIG);
        this.db = firebase.database();
        console.log('✅ Firebase initialized');
        this.updateSyncStatus('connected');
        
        // Start periodic sync
        this.startPeriodicSync();
        
        // Load initial data from Firebase
        await this.loadFromFirebase();
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        this.updateSyncStatus('error');
      }
    } else {
      console.log('📝 Running in LocalStorage-only mode');
      this.updateSyncStatus('local');
    }
    
    // Check sync toggle
    const syncToggle = document.getElementById('firebaseSyncToggle');
    if (syncToggle) {
      syncToggle.checked = this.syncEnabled && window.FIREBASE_ENABLED;
      syncToggle.addEventListener('change', (e) => {
        this.syncEnabled = e.target.checked;
        this.updateSyncStatus(this.syncEnabled ? 'connected' : 'disabled');
      });
    }
  },
  
  // Save data to LocalStorage
  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Saved to LocalStorage: ${key}`);
      return true;
    } catch (error) {
      console.error('LocalStorage save failed:', error);
      return false;
    }
  },
  
  // Load data from LocalStorage
  loadLocal(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('LocalStorage load failed:', error);
      return null;
    }
  },
  
  // Delete from LocalStorage
  deleteLocal(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage delete failed:', error);
      return false;
    }
  },
  
  // Save to Firebase
  async saveFirebase(key, data) {
    if (!this.db || !this.syncEnabled) return false;
    
    try {
      await this.db.ref(key).set(data);
      console.log(`☁️ Synced to Firebase: ${key}`);
      this.pendingSyncs.delete(key);
      this.updateLastSync();
      return true;
    } catch (error) {
      console.error('Firebase save failed:', error);
      this.pendingSyncs.add(key);
      return false;
    }
  },
  
  // Load from Firebase
  async loadFirebase(key) {
    if (!this.db) return null;
    
    try {
      const snapshot = await this.db.ref(key).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Firebase load failed:', error);
      return null;
    }
  },
  
  // Load all data from Firebase
  async loadFromFirebase() {
    if (!this.db) return;
    
    const keys = ['completed-tasks', 'upcoming-tasks', 'notes', 'knowledge-base', 'chat-history'];
    
    for (const key of keys) {
      const firebaseData = await this.loadFirebase(key);
      const localData = this.loadLocal(key);
      
      if (firebaseData) {
        // Merge strategy: use Firebase data if newer or if no local data
        if (!localData || this.isNewer(firebaseData, localData)) {
          this.saveLocal(key, firebaseData);
          console.log(`📥 Loaded from Firebase: ${key}`);
        }
      }
    }
  },
  
  // Universal save method (LocalStorage + Firebase)
  async save(key, data) {
    // Always save to LocalStorage first (instant)
    this.saveLocal(key, data);
    
    // Then sync to Firebase in background
    if (this.syncEnabled && this.db) {
      await this.saveFirebase(key, data);
    }
  },
  
  // Universal load method
  load(key) {
    return this.loadLocal(key);
  },
  
  // Delete data
  async delete(key) {
    this.deleteLocal(key);
    if (this.syncEnabled && this.db) {
      try {
        await this.db.ref(key).remove();
      } catch (error) {
        console.error('Firebase delete failed:', error);
      }
    }
  },
  
  // Manual sync all data
  async syncAll() {
    if (!this.db || !this.syncEnabled) {
      console.log('Sync disabled or Firebase not available');
      return;
    }
    
    this.updateSyncStatus('syncing');
    
    const keys = ['completed-tasks', 'upcoming-tasks', 'notes', 'knowledge-base', 'chat-history'];
    
    for (const key of keys) {
      const data = this.loadLocal(key);
      if (data) {
        await this.saveFirebase(key, data);
      }
    }
    
    this.updateSyncStatus('connected');
    console.log('✅ Full sync completed');
  },
  
  // Start periodic sync
  startPeriodicSync() {
    setInterval(() => {
      if (this.syncEnabled && this.pendingSyncs.size > 0) {
        this.syncAll();
      }
    }, window.APP_CONFIG.syncInterval);
  },
  
  // Check if data is newer
  isNewer(data1, data2) {
    // Simple strategy: compare array lengths or timestamp
    if (Array.isArray(data1) && Array.isArray(data2)) {
      return data1.length > data2.length;
    }
    return true;
  },
  
  // Update sync status UI
  updateSyncStatus(status) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (!statusDot || !statusText) return;
    
    switch (status) {
      case 'connected':
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Cloud Sync Active';
        break;
      case 'syncing':
        statusDot.className = 'status-dot';
        statusText.textContent = 'Syncing...';
        break;
      case 'local':
        statusDot.className = 'status-dot';
        statusText.textContent = 'Local Storage Only';
        break;
      case 'disabled':
        statusDot.className = 'status-dot';
        statusText.textContent = 'Sync Disabled';
        break;
      case 'error':
        statusDot.className = 'status-dot';
        statusText.textContent = 'Sync Error';
        break;
    }
  },
  
  // Update last sync time
  updateLastSync() {
    this.lastSyncTime = new Date();
    const lastSyncEl = document.getElementById('lastSync');
    if (lastSyncEl) {
      lastSyncEl.textContent = this.lastSyncTime.toLocaleTimeString();
    }
  },
  
  // Export all data to JSON file
  exportData() {
    const data = {
      exportDate: new Date().toISOString(),
      farmName: window.APP_CONFIG.farmName,
      completedTasks: this.loadLocal('completed-tasks') || [],
      upcomingTasks: this.loadLocal('upcoming-tasks') || [],
      notes: this.loadLocal('notes') || [],
      knowledgeBase: this.loadLocal('knowledge-base') || [],
      chatHistory: this.loadLocal('chat-history') || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📤 Data exported');
  },
  
  // Import data from JSON file
  async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Confirm with user
      if (!confirm('This will replace all current data. Continue?')) {
        return;
      }
      
      // Save imported data
      if (data.completedTasks) await this.save('completed-tasks', data.completedTasks);
      if (data.upcomingTasks) await this.save('upcoming-tasks', data.upcomingTasks);
      if (data.notes) await this.save('notes', data.notes);
      if (data.knowledgeBase) await this.save('knowledge-base', data.knowledgeBase);
      if (data.chatHistory) await this.save('chat-history', data.chatHistory);
      
      console.log('📥 Data imported');
      
      // Reload the page to show imported data
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Storage = Storage;
}