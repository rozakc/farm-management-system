// ============================================
// MAIN APPLICATION
// Farm Management System
// ============================================

// Initialize application
async function initializeApp() {
  console.log('🌾 Initializing Farm Command Center...');
  
  // Initialize storage system
  await Storage.init();
  
  // Initialize sensor system
  Sensors.init();
  
  // Load all data
  await loadAllData();
  
  // Update statistics
  updateStats();
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('completedTaskDate').value = today;
  document.getElementById('upcomingTaskDate').value = today;
  
  // Setup import file handler
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      Storage.importData(e.target.files[0]);
    }
  });
  
  // Load weather - but don't block initialization
  loadWeather();
  
  console.log('✅ Application initialized');
}

// ============================================
// WEATHER
// ============================================

async function loadWeather() {
  // Since we don't have Claude API access in a standalone app,
  // we'll use a weather API or show a placeholder
  const weatherContent = document.getElementById('weatherContent');
  
  weatherContent.innerHTML = `
    <div class="weather-info">
      Configure a weather API in config.js for live weather updates.<br>
      Or integrate with your preferred weather service.
    </div>
  `;
  
  // Placeholder - you can integrate with weather APIs like:
  // - OpenWeatherMap
  // - WeatherAPI
  // - NOAA/NWS
}

// ============================================
// DATA LOADING
// ============================================

async function loadAllData() {
  // Load completed tasks
  const completedTasks = Storage.load('completed-tasks') || [];
  renderCompletedTasks(completedTasks);

  // Load upcoming tasks
  const upcomingTasks = Storage.load('upcoming-tasks') || [];
  renderUpcomingTasks(upcomingTasks);

  // Load notes
  const notes = Storage.load('notes') || [];
  renderNotes(notes);

  // Load knowledge base
  const knowledge = Storage.load('knowledge-base') || [];
  renderKnowledge(knowledge);
  
  // Load chat history
  const chatHistory = Storage.load('chat-history') || [];
  renderChatHistory(chatHistory);
}

// ============================================
// COMPLETED TASKS
// ============================================

async function addCompletedTask() {
  const input = document.getElementById('completedTaskInput');
  const dateInput = document.getElementById('completedTaskDate');
  
  if (!input.value.trim()) return;

  const task = {
    id: Date.now(),
    description: input.value,
    date: dateInput.value,
    timestamp: new Date().toISOString()
  };

  const tasks = Storage.load('completed-tasks') || [];
  tasks.unshift(task);
  await Storage.save('completed-tasks', tasks);

  input.value = '';
  dateInput.value = new Date().toISOString().split('T')[0];
  renderCompletedTasks(tasks);
  updateStats();
}

function renderCompletedTasks(tasks) {
  const container = document.getElementById('completedTasksList');
  if (tasks.length === 0) {
    container.innerHTML = '<div class="empty-state">No completed tasks yet</div>';
    return;
  }

  container.innerHTML = tasks.map((task, index) => `
    <div class="list-item" style="animation-delay: ${index * 0.05}s">
      <div class="content">
        <div class="title">${escapeHtml(task.description)}</div>
        <div class="meta">Completed: ${formatDate(task.date)}</div>
      </div>
      <button class="delete-btn" onclick="deleteCompletedTask(${task.id})">×</button>
    </div>
  `).join('');
}

async function deleteCompletedTask(id) {
  const tasks = Storage.load('completed-tasks') || [];
  const filtered = tasks.filter(t => t.id !== id);
  await Storage.save('completed-tasks', filtered);
  renderCompletedTasks(filtered);
  updateStats();
}

// ============================================
// UPCOMING TASKS
// ============================================

async function addUpcomingTask() {
  const input = document.getElementById('upcomingTaskInput');
  const dateInput = document.getElementById('upcomingTaskDate');
  
  if (!input.value.trim()) return;

  const task = {
    id: Date.now(),
    description: input.value,
    dueDate: dateInput.value,
    timestamp: new Date().toISOString()
  };

  const tasks = Storage.load('upcoming-tasks') || [];
  tasks.unshift(task);
  await Storage.save('upcoming-tasks', tasks);

  input.value = '';
  dateInput.value = new Date().toISOString().split('T')[0];
  renderUpcomingTasks(tasks);
  updateStats();
}

function renderUpcomingTasks(tasks) {
  const container = document.getElementById('upcomingTasksList');
  if (tasks.length === 0) {
    container.innerHTML = '<div class="empty-state">No upcoming tasks</div>';
    return;
  }

  // Sort by due date
  const sorted = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  container.innerHTML = sorted.map((task, index) => `
    <div class="list-item" style="animation-delay: ${index * 0.05}s">
      <div class="content">
        <div class="title">${escapeHtml(task.description)}</div>
        <div class="meta">Due: ${formatDate(task.dueDate)}</div>
      </div>
      <button class="delete-btn" onclick="deleteUpcomingTask(${task.id})">×</button>
    </div>
  `).join('');
}

async function deleteUpcomingTask(id) {
  const tasks = Storage.load('upcoming-tasks') || [];
  const filtered = tasks.filter(t => t.id !== id);
  await Storage.save('upcoming-tasks', filtered);
  renderUpcomingTasks(filtered);
  updateStats();
}

// ============================================
// NOTES
// ============================================

async function addNote() {
  const input = document.getElementById('noteInput');
  
  if (!input.value.trim()) return;

  const note = {
    id: Date.now(),
    content: input.value,
    timestamp: new Date().toISOString()
  };

  const notes = Storage.load('notes') || [];
  notes.unshift(note);
  await Storage.save('notes', notes);

  input.value = '';
  renderNotes(notes);
  updateStats();
}

function renderNotes(notes) {
  const container = document.getElementById('notesList');
  if (notes.length === 0) {
    container.innerHTML = '<div class="empty-state">No notes yet</div>';
    return;
  }

  container.innerHTML = notes.map((note, index) => `
    <div class="list-item" style="animation-delay: ${index * 0.05}s">
      <div class="content">
        <div class="title">${escapeHtml(note.content)}</div>
        <div class="meta">${new Date(note.timestamp).toLocaleString()}</div>
      </div>
      <button class="delete-btn" onclick="deleteNote(${note.id})">×</button>
    </div>
  `).join('');
}

async function deleteNote(id) {
  const notes = Storage.load('notes') || [];
  const filtered = notes.filter(n => n.id !== id);
  await Storage.save('notes', filtered);
  renderNotes(filtered);
  updateStats();
}

// ============================================
// KNOWLEDGE BASE
// ============================================

async function addKnowledge() {
  const topicInput = document.getElementById('knowledgeTopic');
  const contentInput = document.getElementById('knowledgeContent');
  
  if (!topicInput.value.trim() || !contentInput.value.trim()) return;

  const item = {
    id: Date.now(),
    topic: topicInput.value,
    content: contentInput.value,
    timestamp: new Date().toISOString()
  };

  const knowledge = Storage.load('knowledge-base') || [];
  knowledge.unshift(item);
  await Storage.save('knowledge-base', knowledge);

  topicInput.value = '';
  contentInput.value = '';
  renderKnowledge(knowledge);
  updateStats();
}

function renderKnowledge(knowledge) {
  const container = document.getElementById('knowledgeList');
  if (knowledge.length === 0) {
    container.innerHTML = '<div class="empty-state">No knowledge base entries yet. Start teaching your AI assistant about your farm!</div>';
    return;
  }

  container.innerHTML = knowledge.map((item, index) => `
    <div class="knowledge-item" style="animation-delay: ${index * 0.05}s">
      <div class="topic">${escapeHtml(item.topic)}</div>
      <div class="content">${escapeHtml(item.content)}</div>
      <div class="timestamp">Added: ${new Date(item.timestamp).toLocaleString()}</div>
      <button class="delete-btn" onclick="deleteKnowledge(${item.id})" style="margin-top: 0.5rem;">Delete</button>
    </div>
  `).join('');
}

async function deleteKnowledge(id) {
  const knowledge = Storage.load('knowledge-base') || [];
  const filtered = knowledge.filter(k => k.id !== id);
  await Storage.save('knowledge-base', filtered);
  renderKnowledge(filtered);
  updateStats();
}

// ============================================
// STATISTICS
// ============================================

async function updateStats() {
  const completedTasks = Storage.load('completed-tasks') || [];
  const upcomingTasks = Storage.load('upcoming-tasks') || [];
  const notes = Storage.load('notes') || [];
  const knowledge = Storage.load('knowledge-base') || [];

  document.getElementById('taskCount').textContent = completedTasks.length;
  document.getElementById('upcomingCount').textContent = upcomingTasks.length;
  document.getElementById('noteCount').textContent = notes.length;
  document.getElementById('knowledgeCount').textContent = knowledge.length;
}

// ============================================
// AI CHAT
// ============================================

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;

  // Add user message
  addChatMessage('user', message);
  input.value = '';

  // Show typing indicator
  const typingId = addChatMessage('assistant', 'Thinking...');

  // Gather all farm data for context
  const completedTasks = Storage.load('completed-tasks') || [];
  const upcomingTasks = Storage.load('upcoming-tasks') || [];
  const notes = Storage.load('notes') || [];
  const knowledge = Storage.load('knowledge-base') || [];
  const sensorContext = Sensors.getSensorContext();

  const farmContext = `
FARM DATA CONTEXT:

${sensorContext}

KNOWLEDGE BASE (${knowledge.length} entries):
${knowledge.map(k => `- ${k.topic}: ${k.content}`).join('\n')}

COMPLETED TASKS (${completedTasks.length} total, showing recent):
${completedTasks.slice(0, 20).map(t => `- ${t.description} (${new Date(t.date).toLocaleDateString()})`).join('\n')}

UPCOMING TASKS (${upcomingTasks.length} total):
${upcomingTasks.map(t => `- ${t.description} (Due: ${new Date(t.dueDate).toLocaleDateString()})`).join('\n')}

NOTES (${notes.length} total, showing recent):
${notes.slice(0, 10).map(n => `- ${n.content} (${new Date(n.timestamp).toLocaleDateString()})`).join('\n')}

Based on the above farm data, please answer the following question or provide relevant insights:
${message}
`;

  // For standalone deployment, you'll need to implement your own AI backend
  // Options:
  // 1. Use Claude API with your own API key (requires backend to hide key)
  // 2. Use OpenAI API
  // 3. Use local LLM
  // 4. Use serverless function (Firebase, Netlify, Vercel)
  
  // Placeholder response
  setTimeout(() => {
    document.getElementById(typingId).remove();
    
    const response = `I'm a placeholder response. To enable AI functionality, you'll need to:

1. Set up a backend API endpoint (Firebase Cloud Function, Netlify Function, etc.)
2. Add your Claude API key to the backend
3. Update the sendMessage() function in app.js to call your backend

Your question was: "${message}"

I can see you have:
- ${completedTasks.length} completed tasks
- ${upcomingTasks.length} upcoming tasks
- ${notes.length} notes
- ${knowledge.length} knowledge base entries
${Object.keys(Sensors.sensorData).length > 0 ? `- ${Object.keys(Sensors.sensorData).length} active sensors` : ''}

To get started with AI integration, check the README.md file.`;
    
    addChatMessage('assistant', response);
    
    // Store conversation
    const history = Storage.load('chat-history') || [];
    history.push(
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response, timestamp: new Date().toISOString() }
    );
    Storage.save('chat-history', history.slice(-50));
  }, 1000);
}

function addChatMessage(role, content) {
  const container = document.getElementById('chatMessages');
  const messageId = `msg-${Date.now()}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;
  messageDiv.id = messageId;
  messageDiv.innerHTML = `
    <div class="message-content">
      <div class="role">${role === 'user' ? 'You' : 'Farm Assistant'}</div>
      ${escapeHtml(content)}
    </div>
  `;
  
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
  
  return messageId;
}

function renderChatHistory(history) {
  const container = document.getElementById('chatMessages');
  // Keep the welcome message, add history after it
  history.forEach(msg => {
    addChatMessage(msg.role, msg.content);
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format date without timezone issues
// Input: "2025-01-12" (YYYY-MM-DD string from date input)
// Output: "1/12/2025" (locale string of that exact date)
function formatDate(dateString) {
  if (!dateString) return '';
  
  // Parse the date as local time, not UTC
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  return date.toLocaleDateString();
}

function exportData() {
  Storage.exportData();
}

function importData() {
  document.getElementById('importFile').click();
}

async function manualSync() {
  const button = document.getElementById('syncButton');
  button.disabled = true;
  button.textContent = '🔄 Syncing...';
  
  await Storage.syncAll();
  
  button.disabled = false;
  button.textContent = '🔄 Sync Now';
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

window.addEventListener('DOMContentLoaded', initializeApp);