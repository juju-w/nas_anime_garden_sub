# Architecture Design: NAS Anime Garden Subscription Tool

This document outlines the architectural components and data flow for the NAS-based anime subscription tool.

## Overview

The system is designed as a modular application with a frontend for user management and a backend that handles RSS tracking and downloader integration. It aims to be lightweight for NAS environments.

## Components

### 1. Frontend (Web Dashboard)
- **Tech Stack:** React (TypeScript), Tailwind CSS.
- **Features:**
  - RSS Management: Add/Remove feeds from `animes.garden`.
  - Filters: Configure keyword inclusion/exclusion per RSS feed.
  - History: View previously downloaded episodes.
  - Settings: Configure downloader connection (e.g., Aria2 RPC URL and Secret).

### 2. Backend (FastAPI)
- **Tech Stack:** Python 3.10+, FastAPI, Pydantic, SQLAlchemy.
- **Core Modules:**
  - **API Layer:** Provides endpoints for the frontend to manage subscriptions and settings.
  - **Scheduler:** Uses `APScheduler` or native `asyncio` loops to periodically check RSS feeds.
  - **RSS Parser:** Fetches XML feeds, parses metadata (title, link, magnet), and applies user-defined keyword filters.
  - **Downloader Service:** Client for interacting with Aria2 via JSON-RPC.
  - **Database:** SQLite used for storing RSS feeds, filters, and download history.

### 3. Database Schema (Draft)
- **`Subscriptions`**: `id`, `url`, `name`, `status` (active/inactive), `last_checked_at`.
- **`Filters`**: `id`, `subscription_id`, `keyword` (regex or substring), `type` (include/exclude).
- **`DownloadHistory`**: `id`, `subscription_id`, `episode_title`, `magnet_link`, `status`, `created_at`.
- **`Settings`**: Key-Value store for downloader settings.

### 4. Downloader (Aria2)
- **Integration:** Communicates with the backend via JSON-RPC.
- **Deployment:** Can be deployed alongside the app using Docker Compose.

## Data Flow

1. **User Interaction:** The user adds an RSS URL and keywords via the React dashboard.
2. **Persistence:** The backend saves these settings to the SQLite database.
3. **Tracking Loop:**
   - Every `N` minutes, the Scheduler triggers an RSS check for all active subscriptions.
   - The RSS Parser fetches the feed and extracts item metadata.
   - For each item, it checks against the filters for that subscription.
   - If a new, matching item is found, the magnet link is sent to the Downloader Service.
4. **Download Execution:** The Downloader Service submits the task to Aria2.
5. **Update History:** The backend records the download in the `DownloadHistory` table to avoid duplicate downloads.

## Deployment Strategy (Docker)

The application will be packaged into a multi-container environment:
- **`app`**: Combines the React frontend (built and served or via a proxy) and the FastAPI backend.
- **`aria2`**: Optional container for the downloader.
- **`data`**: Shared volume for storing the SQLite database and potentially downloaded files (if managed).

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite:///data/app.db
      - ARIA2_RPC_URL=http://aria2:6800/jsonrpc
  aria2:
    image: p3terx/aria2-pro
    # ... aria2 configuration ...
```
