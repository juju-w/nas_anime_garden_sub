# 动漫花园RSS订阅工具 (Anime Garden RSS Subscription Tool)

English | [中文说明](./README_CN.md)

A powerful, lightweight web-based tool for NAS environments to automate anime downloads from `animes.garden` RSS feeds. It monitors feeds, filters by keywords (e.g., "简繁内封"), and automatically submits magnet links to Aria2.

## Key Features

- **Smart Subscription Manager**: Add anime RSS feeds with custom tracking rules.
- **Advanced Keyword Filtering**: Include or exclude episodes based on resolution, language, or fansub group (e.g., `简繁内封`, `1080P`).
- **Flexible Sync Modes**: 
  - **Archive Mode**: Download all matching historical episodes from the current feed.
  - **Monitor Mode**: Only track and download future releases.
- **Aria2 Integration**: Seamless connection via JSON-RPC.
- **Automatic Background Tracking**: Periodically checks for updates every 10 minutes.
- **Modern Web UI**: Responsive dashboard built with React, Tailwind CSS, and Lucide icons.
- **Dockerized Deployment**: Ready to run with a single `docker-compose` command.

## Screenshots

> Please place your screenshots in the `docs/images/` directory.

![Dashboard](./docs/images/dashboard.png)
*Intuitive subscription management with real-time toggles.*

![History](./docs/images/history.png)
*Modern, card-based download history with status indicators.*

![Settings](./docs/images/settings.png)
*Flexible Aria2 RPC configuration with 1-click AriaNg access.*

## Tech Stack

- **Frontend**: React (TypeScript), Tailwind CSS, TanStack Query.
- **Backend**: FastAPI (Python), SQLAlchemy, APScheduler.
- **Database**: SQLite (Portable and lightweight).
- **Downloader**: Aria2 (via RPC).

## Getting Started

### Prerequisites

- Docker and Docker Compose installed.

### Deployment

1. Clone the repository to your NAS.
2. Review `docker-compose.yml` and set your `ARIA2_RPC_SECRET`.
3. Start the stack:
   ```bash
   docker-compose up -d
   ```
4. Access the Web UI at `http://<your-nas-ip>:8000`.

### Using an External Downloader (Aria2)

If you prefer to use an **existing Aria2 instance** on your NAS instead of the bundled container, follow these steps:

1. In `docker-compose.yml`, remove the `aria2` and `ariang` service blocks, keeping only the `app` service.
2. Start the `app` container and access the Web UI (`http://<your-nas-ip>:8000`).
3. Navigate to **"Settings"** in the top right.
4. Enter your existing Aria2 address in the **"RPC Endpoint"** field (e.g., `http://192.168.1.100:6800/jsonrpc`).
5. Enter your existing Aria2 secret in the **"RPC Secret Token"** field.
6. Click **"Save Configuration"**. The backend will instantly switch to your external downloader.

### Usage Tips

- **Adding a tracker**: Use URLs from `animes.garden` (e.g., `https://api.animes.garden/feed.xml?subject=515759`).
- **Keywords**: Use commas to separate multiple inclusion keywords (e.g., `简繁内封, 1080P`).
- **Initial Sync**: If you want to download episodes already in the feed, check "Download historical episodes" when adding the tracker.

## License

MIT
