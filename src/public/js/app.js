let apps = [];
let filteredApps = [];
let config = {};

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        config = await response.json();
        
        document.documentElement.style.setProperty('--primary-color', config.theme.primaryColor);
        document.documentElement.style.setProperty('--background-color', config.theme.backgroundColor);
        document.documentElement.style.setProperty('--text-color', config.theme.textColor);
        
        const pageTitle = document.getElementById('page-title');
        const portalTitle = document.getElementById('portal-title');
        if (pageTitle) pageTitle.textContent = config.portalTitle;
        if (portalTitle) portalTitle.textContent = config.portalTitle;
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function loadApps() {
    try {
        const response = await fetch('/api/apps');
        apps = await response.json();
        filteredApps = [...apps];
        updateCategoryFilter();
        renderApps();
        renderAppsTable();
    } catch (error) {
        console.error('Error loading apps:', error);
    }
}

function renderApps() {
    const grid = document.getElementById('apps-grid');
    if (!grid) return;
    
    if (filteredApps.length === 0) {
        grid.innerHTML = '<p>No apps found.</p>';
        return;
    }
    
    grid.innerHTML = filteredApps.map(app => `
        <a href="${app.url}" class="app-card" target="_blank">
            <div class="app-card-header">
                <img src="${app.icon || 'https://via.placeholder.com/48'}" alt="${app.name}" class="app-icon">
                <div class="app-name">${app.name}</div>
            </div>
            <div class="app-description">${app.description}</div>
            <div class="app-category">${app.category}</div>
        </a>
    `).join('');
}

function updateCategoryFilter() {
    const select = document.getElementById('category-filter');
    if (!select) return;
    
    const categories = [...new Set(apps.map(app => app.category))];
    select.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function renderAppsTable() {
    const tbody = document.querySelector('#apps-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = apps.map(app => `
        <tr>
            <td>${app.name}</td>
            <td>${app.category}</td>
            <td>
                <button onclick="editApp('${app.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteApp('${app.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterApps() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || '';
    
    filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm) ||
            app.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || app.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderApps();
}

async function addApp(e) {
    e.preventDefault();
    hideError('add-app-error');
    
    const newApp = {
        name: document.getElementById('app-name').value,
        description: document.getElementById('app-description').value,
        url: document.getElementById('app-url').value,
        icon: document.getElementById('app-icon').value || 'https://via.placeholder.com/48',
        category: document.getElementById('app-category').value
    };
    
    try {
        const response = await fetch('/api/apps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newApp)
        });
        
        if (response.ok) {
            hideError('add-app-error');
            document.getElementById('add-app-form').reset();
            await loadApps();
        } else {
            const errorData = await response.json();
            showError('add-app-error', errorData.error || 'Failed to add app');
        }
    } catch (error) {
        console.error('Error adding app:', error);
        showError('add-app-error', 'Network error. Please try again.');
    }
}

function editApp(id) {
    const app = apps.find(a => a.id === id);
    if (!app) return;
    
    hideError('edit-app-error');
    
    document.getElementById('edit-app-id').value = app.id;
    document.getElementById('edit-app-name').value = app.name;
    document.getElementById('edit-app-description').value = app.description;
    document.getElementById('edit-app-url').value = app.url;
    document.getElementById('edit-app-icon').value = app.icon;
    document.getElementById('edit-app-category').value = app.category;
    
    document.getElementById('edit-modal').classList.add('active');
}

async function updateApp(e) {
    e.preventDefault();
    hideError('edit-app-error');
    
    const id = document.getElementById('edit-app-id').value;
    const updatedApp = {
        name: document.getElementById('edit-app-name').value,
        description: document.getElementById('edit-app-description').value,
        url: document.getElementById('edit-app-url').value,
        icon: document.getElementById('edit-app-icon').value || 'https://via.placeholder.com/48',
        category: document.getElementById('edit-app-category').value
    };
    
    try {
        const response = await fetch(`/api/apps/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp)
        });
        
        if (response.ok) {
            hideError('edit-app-error');
            closeModal();
            await loadApps();
        } else {
            const errorData = await response.json();
            showError('edit-app-error', errorData.error || 'Failed to update app');
        }
    } catch (error) {
        console.error('Error updating app:', error);
        showError('edit-app-error', 'Network error. Please try again.');
    }
}

async function deleteApp(id) {
    if (!confirm('Are you sure you want to delete this app?')) return;
    
    try {
        const response = await fetch(`/api/apps/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadApps();
        } else {
            const errorData = await response.json();
            alert(`Failed to delete app: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting app:', error);
        alert('Network error. Please try again.');
    }
}

function closeModal() {
    hideError('edit-app-error');
    document.getElementById('edit-modal').classList.remove('active');
}

function showMigrationMessage(message, isError = false) {
    const msgEl = document.getElementById('migration-message');
    if (msgEl) {
        msgEl.textContent = message;
        msgEl.className = 'migration-message ' + (isError ? 'error' : 'success');
        setTimeout(() => {
            msgEl.textContent = '';
            msgEl.className = 'migration-message';
        }, 5000);
    }
}

async function exportData() {
    window.location.href = '/api/admin/export';
}

async function importData(file) {
    if (!confirm('This will replace all current data. Continue?')) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            const response = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showMigrationMessage('Import successful!');
                await loadApps();
                await loadConfig();
            } else {
                const errorData = await response.json();
                showMigrationMessage(errorData.error || 'Failed to import data', true);
            }
        } catch (error) {
            showMigrationMessage('Invalid JSON file', true);
        }
    };
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadApps();
    
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const addAppForm = document.getElementById('add-app-form');
    const editAppForm = document.getElementById('edit-app-form');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    
    if (searchInput) searchInput.addEventListener('input', filterApps);
    if (categoryFilter) categoryFilter.addEventListener('change', filterApps);
    if (addAppForm) addAppForm.addEventListener('submit', addApp);
    if (editAppForm) editAppForm.addEventListener('submit', updateApp);
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (importBtn) importBtn.addEventListener('click', () => importFile.click());
    if (importFile) importFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importData(e.target.files[0]);
            e.target.value = '';
        }
    });
});
