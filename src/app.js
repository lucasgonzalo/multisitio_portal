const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '../data/apps.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let appsData = {
  portalTitle: "Multisitios Apps Portal",
  theme: {
    primaryColor: "#3b82f6",
    backgroundColor: "#f3f4f6",
    textColor: "#1f2937"
  },
  apps: []
};

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

app.post('/api/apps', (req, res) => {
  const newApp = req.body;
  newApp.id = 'app-' + Date.now();
  appsData.apps.push(newApp);
  saveData();
  res.json(newApp);
});

app.put('/api/apps/:id', (req, res) => {
  const index = appsData.apps.findIndex(app => app.id === req.params.id);
  if (index !== -1) {
    appsData.apps[index] = { ...appsData.apps[index], ...req.body };
    saveData();
    res.json(appsData.apps[index]);
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

app.delete('/api/apps/:id', (req, res) => {
  const index = appsData.apps.findIndex(app => app.id === req.params.id);
  if (index !== -1) {
    appsData.apps.splice(index, 1);
    saveData();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Portal running on port ${PORT}`);
});
