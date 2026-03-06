# Multisitios Apps Portal

A simple apps portal for managing and displaying applications deployed with Dokploy.

## Features

- Clean, responsive interface
- Manual app management (add, edit, delete)
- Search and filter apps by category
- Admin panel for easy management
- JSON-based configuration (no database required)
- Docker-ready for Dokploy deployment

## Project Structure

```
multisitios/
├── src/
│   ├── app.js              # Express server
│   └── public/
│       ├── index.html      # Main portal page
│       ├── admin.html      # Admin interface
│       ├── css/
│       │   └── styles.css  # Styling
│       └── js/
│           └── app.js      # Frontend JavaScript
├── data/
│   └── apps.json           # App configuration file
├── Dockerfile              # Docker configuration
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser:
- Portal: http://localhost:3000
- Admin: http://localhost:3000/admin

## Deployment on Dokploy

### Option 1: Using Dockerfile (Recommended for Code Updates)

1. **Create a new application** in Dokploy
2. **Select "Docker"** as the deployment type
3. **Set the build context** to the project directory
4. **Configure the subdomain** (e.g., `portal.multisitios.top`)
5. **Deploy** the application

### Option 2: Using Volume Mount (Recommended for Frequent App Updates)

To easily update your apps without rebuilding the image, mount the `data/apps.json` file:

1. Create a Docker image from the Dockerfile
2. In Dokploy, add a volume mount:
   - Host path: `/path/to/your/data/apps.json`
   - Container path: `/app/data/apps.json`
3. Now you can edit the JSON file directly on your server to update apps

### Environment Variables

- `PORT`: Server port (default: 3000)

## Managing Apps

### Via Admin Panel

1. Navigate to `/admin`
2. Fill in the form to add a new app
3. Use the table to edit or delete existing apps

### Via JSON File

Edit `data/apps.json` directly:

```json
{
  "portalTitle": "Multisitios Apps Portal",
  "theme": {
    "primaryColor": "#3b82f6",
    "backgroundColor": "#f3f4f6",
    "textColor": "#1f2937"
  },
  "apps": [
    {
      "id": "app-1",
      "name": "My App",
      "description": "App description",
      "url": "https://app.multisitios.top",
      "icon": "https://via.placeholder.com/64",
      "category": "Web Apps"
    }
  ]
}
```

## API Endpoints

- `GET /api/config` - Get portal configuration
- `GET /api/apps` - Get all apps
- `POST /api/apps` - Create a new app
- `PUT /api/apps/:id` - Update an app
- `DELETE /api/apps/:id` - Delete an app

## Customization

### Change Portal Title and Theme

Edit the `portalTitle` and `theme` properties in `data/apps.json`:

```json
{
  "portalTitle": "My Custom Portal",
  "theme": {
    "primaryColor": "#8b5cf6",
    "backgroundColor": "#ffffff",
    "textColor": "#000000"
  }
}
```

### Add Custom Styling

Edit `src/public/css/styles.css` to customize the appearance.

## License

MIT
