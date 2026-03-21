require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '../data/apps.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

function requireAuthPage(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

let appsData = {
  portalTitle: "Multisitios Apps Portal",
  theme: {
    primaryColor: "#3b82f6",
    backgroundColor: "#f3f4f6",
    textColor: "#1f2937"
  },
  apps: []
};

function logLoginAttempt(req, success) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(`[${timestamp}] ${status} login attempt from IP: ${ip}`);
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      appsData = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appsData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

loadData();

app.get('/api/config', (req, res) => {
  res.json({
    portalTitle: appsData.portalTitle,
    theme: appsData.theme
  });
});

app.get('/api/apps', (req, res) => {
  res.json(appsData.apps);
});

app.post('/api/apps', requireAuth, (req, res) => {
  const newApp = req.body;
  newApp.id = 'app-' + Date.now();
  appsData.apps.push(newApp);
  saveData();
  res.json(newApp);
});

app.put('/api/apps/:id', requireAuth, (req, res) => {
  const index = appsData.apps.findIndex(app => app.id === req.params.id);
  if (index !== -1) {
    appsData.apps[index] = { ...appsData.apps[index], ...req.body };
    saveData();
    res.json(appsData.apps[index]);
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

app.delete('/api/apps/:id', requireAuth, (req, res) => {
  const index = appsData.apps.findIndex(app => app.id === req.params.id);
  if (index !== -1) {
    appsData.apps.splice(index, 1);
    saveData();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

app.get('/api/admin/export', requireAuth, (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `apps-portal-${timestamp}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(appsData);
});

app.post('/api/admin/import', requireAuth, (req, res) => {
  try {
    const data = req.body;
    
    if (!data || !data.portalTitle || !data.theme || !Array.isArray(data.apps)) {
      return res.status(400).json({ error: 'Invalid file format. Must contain portalTitle, theme, and apps array.' });
    }
    
    const backupPath = DATA_FILE + '.bak';
    fs.writeFileSync(backupPath, JSON.stringify(appsData, null, 2));
    
    appsData = {
      portalTitle: data.portalTitle,
      theme: data.theme,
      apps: data.apps
    };
    saveData();
    
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', requireAuthPage, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    logLoginAttempt(req, true);
    res.json({ success: true });
  } else {
    logLoginAttempt(req, false);
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Portal running on port ${PORT}`);
});
