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

### Usage Tips

- **Adding a tracker**: Use URLs from `animes.garden` (e.g., `https://api.animes.garden/feed.xml?subject=515759`).
- **Keywords**: Use commas to separate multiple inclusion keywords (e.g., `简繁内封, 1080P`).
- **Initial Sync**: If you want to download episodes already in the feed, check "Download historical episodes" when adding the tracker.

## License

MIT
