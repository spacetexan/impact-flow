# Impact Flow

A visual team delegation dashboard built on the Impact Filter Framework from "Who Not How". Uses React Flow to visualize delegation hierarchies as mind maps.

## Purpose

Impact Flow helps managers and team leads delegate work effectively by:

- Visualizing team members and their delegated projects as an interactive mind map
- Tracking project status (planned, in progress, complete, blocked)
- Documenting the "why" behind each delegation using the Impact Filter methodology
- Managing success criteria for each project

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/spacetexan/impact-flow.git
cd impact-flow

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start the development server (frontend + backend)
npm run dev:full
```

The app will be available at http://localhost:8080

### Data Storage

Data is stored in a local SQLite database file at `data/impact-flow.db`. This file persists across restarts and can be backed up or copied.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:full` | Start both frontend and backend servers |
| `npm run dev` | Start frontend only (Vite) |
| `npm run dev:server` | Start backend only (Express) |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
