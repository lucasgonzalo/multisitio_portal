# Multisitios Apps Portal

A simple apps portal for managing and displaying applications deployed with Dokploy.

## Features

- Clean, responsive interface
- Manual app management (add, edit, delete)
- Search and filter apps by category
- Admin panel for easy management
- JSON-based configuration (no database required)
- Docker-ready for Dokploy deployment
- Password-protected admin panel with session-based authentication

## Project Structure

```
multisitios/
├── src/
│   ├── app.js              # Express server
│   └── public/
│       ├── index.html      # Main portal page
│       ├── admin.html      # Admin interface
│       ├── login.html      # Login page
│       ├── css/
│       │   └── styles.css  # Styling
│       └── js/
│           ├── app.js      # Frontend JavaScript
│           └── login.js    # Login form handler
├── data/
│   └── apps.json           # App configuration file
├── Dockerfile              # Production Docker configuration (Dokploy)
├── Dockerfile.dev          # Development Docker configuration (hot-reload)
├── docker-compose.yml       # Docker Compose for development
├── .dockerignore           # Docker build exclusions
├── .env.docker.example     # Docker environment template
├── .env.example           # Environment variables template
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## Local Development

### Option 1: Node.js (Without Docker)

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

### Option 2: Docker with Hot-Reload (Recommended)

1. Copy environment template:
```bash
cp .env.docker.example .env
```

2. Start development container:
```bash
docker-compose up
```

3. Open your browser:
- Portal: http://localhost:3000
- Admin: http://localhost:3000/admin

Benefits:
- Hot-reload on code changes
- Changes to `data/` are instant
- Clean, isolated development environment

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

### Environment Variables for Dokploy

Set these in your Dokploy application's environment variables:
- `ADMIN_PASSWORD`: Your admin password (required)
- `SESSION_SECRET`: Random secret key (required, generate with `openssl rand -base64 32`)
- `PORT`: Server port (optional, default: 3000)
- `NODE_ENV`: Set to `production` (optional, enables HTTPS cookies)

## Docker Development

### Quick Start

```bash
# 1. Copy environment template
cp .env.docker.example .env

# 2. Start development container with hot-reload
docker-compose up

# 3. Access application
# Portal: http://localhost:3000
# Admin: http://localhost:3000/admin
```

### Docker Commands

**Development:**
```bash
# Start development container (hot-reload)
docker-compose up

# Build and start (if Dockerfile changes)
docker-compose up --build

# Run in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f portal

# Execute commands in container
docker-compose exec portal sh

# Restart container
docker-compose restart
```

**Production Build (Optional):**
```bash
# Build production image (same as Dokploy)
docker build -t portal-prod .

# Run production container
docker run -p 3000:3000 \
  -e ADMIN_PASSWORD=your-password \
  -e SESSION_SECRET=your-secret \
  portal-prod
```

### Hot-Reload Features

- Server automatically restarts when you edit files in `src/`
- Changes to `data/apps.json` are reflected instantly
- No need to rebuild or restart container

**Note:** Changes in `src/` require nodemon to restart (automatic). Changes in `data/` are instant.

### Volume Mounts (Development Only)

- **`./src:/app/src`** - Live reload of code changes (read-only)
- **`./data:/app/data`** - Instant app data updates
- **`/app/node_modules`** - Prevents host node_modules from overwriting container's

### Environment Variables

**In Docker Development:**
```bash
# Using .env file (recommended for development)
cp .env.docker.example .env
# Edit .env with your values
docker-compose up

# Passing directly (CLI)
ADMIN_PASSWORD=secure123 docker-compose up

# Using docker run
docker run -e ADMIN_PASSWORD=secure123 -e SESSION_SECRET=random-secret portal-dev
```

**In Dokploy (Production):**
- Set in Dokploy environment variables section
- Required: `ADMIN_PASSWORD`, `SESSION_SECRET`
- Optional: `PORT` (default: 3000), `NODE_ENV` (set to `production`)

### File Structure

- `Dockerfile` - Production build (used by Dokploy)
- `Dockerfile.dev` - Development with hot-reload (local only)
- `docker-compose.yml` - Development workflow (local only)
- `.dockerignore` - Excludes dev files from production builds

### Troubleshooting

**Volume mount issues:**
```bash
# Rebuild containers
docker-compose down
docker-compose up --build --force-recreate
```

**Port already in use:**
```bash
# Change port in docker-compose.yml or stop other service
ports:
  - "3001:3000"  # Use 3001 instead
```

**Hot-reload not working:**
- Ensure volumes are correctly mounted
- Check that file changes are syncing to container: `docker-compose exec portal ls -la /app/src`
- Verify nodemon is installed and running

**Changes not reflecting:**
- For `src/` changes: Wait 1-2 seconds for nodemon to restart
- For `data/` changes: Should be instant, check volume mount
- Verify volumes are properly mounted: `docker-compose exec portal ls -la /app/data`

## Authentication

The admin panel and app management features are protected with password authentication.

### Setup

1. Set environment variables (see Environment Variables section)
2. Access the admin panel at `/admin`
3. You'll be redirected to `/admin/login` to enter your password
4. Once logged in, you can manage apps via the admin panel
5. Session expires after 24 hours (configurable)

### Security Features

- Session-based authentication (password not sent repeatedly)
- Signed session cookies prevent tampering
- httpOnly cookies prevent XSS attacks
- Password stored in environment variable (never in code)
- Configurable session timeout
- Protection against session hijacking

### Login and Logout

- **Login**: Visit `/admin` → Enter password → Access admin panel
- **Logout**: Click "Logout" button in admin panel header

### For HTTPS Deployment

Update session configuration for production:
- Set `NODE_ENV=production` environment variable
- Session cookies will automatically use `secure: true`

## Environment Variables

### Required Variables

- `ADMIN_PASSWORD`: Password for admin panel access (required)
- `SESSION_SECRET`: Secret key for session security (required, minimum 32 characters)

### Optional Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production, affects HTTPS cookies)

### Generating SESSION_SECRET

Generate a secure SESSION_SECRET:
```bash
openssl rand -base64 32
```

### Setting Environment Variables

**Local Development (Node.js):**
Create a `.env` file:
```bash
PORT=3000
ADMIN_PASSWORD=your-password
SESSION_SECRET=your-secret
```

**Local Development (Docker):**
```bash
# Copy template
cp .env.docker.example .env

# Edit .env with your values
docker-compose up
```

**Dokploy (Production):**
Set environment variables in Dokploy application settings

## Managing Apps

### Via Admin Panel (Requires Login)

1. Navigate to `/admin`
2. Login with your admin password
3. Fill in the form to add a new app
4. Use the table to edit or delete existing apps
5. Click "Logout" when finished

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

### Public Endpoints (No Authentication Required)
- `GET /api/config` - Get portal configuration
- `GET /api/apps` - Get all apps (read-only)

### Protected Endpoints (Require Admin Login)
- `POST /api/apps` - Create a new app
- `PUT /api/apps/:id` - Update an app
- `DELETE /api/apps/:id` - Delete an app

### Authentication Endpoints
- `GET /admin/login` - Login page
- `POST /admin/login` - Login submission
- `POST /admin/logout` - Logout

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
