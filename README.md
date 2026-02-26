# 动漫花园RSS订阅工具 (Anime Garden RSS Subscription Tool)

English | [中文说明](./README_CN.md)

A powerful, lightweight web-based tool for NAS environments to automate anime downloads from `animes.garden` RSS feeds. It monitors feeds, filters by keywords, and automatically submits magnet links to Aria2 or exports them for other downloaders.

## Key Features

- **🚀 Minimalist UI**: Clean Apple-style design with support for English, Chinese, and Japanese (persisted in local storage).
- **⚙️ Smart Task Management**: Real-time sliding toggles to enable/disable tasks. Edit any subscription (title, URL, keywords) anytime.
- **🔍 Advanced Keyword Filtering**: Precisely target episodes using inclusion keywords (e.g., `1080P`, `简繁内封`).
- **⚡ Instant Sync**: No waiting—adding, editing, or enabling a tracker triggers an immediate background RSS sync.
- **📥 Flexible Sync Modes**:
  - **Archive Mode**: Downloads all matching historical episodes from the current feed.
  - **Monitor Mode**: Tracks future releases only, preventing redundant downloads.
- **🔗 Multiple Downloader Support**:
  - **Aria2 Integration**: Automatic task submission via JSON-RPC. Includes a 1-click autoconnect link to the AriaNg console.
  - **Bulk Export**: Copy all magnet links or export them as a `.txt` file—perfect for Xunlei, Znas, and others.
- **🛠️ Performance & Reliability**:
  - **High Performance**: Optimized with settings caching, connection pooling, and threaded RSS parsing for buttery-smooth responsiveness.
  - **Data Persistence**: Volumes map database and config files to your host, ensuring updates don't wipe your data.
  - **Aria2 Tuning**: Pre-configured with auto-updated Tracker lists and optimized BT/PT settings for max speed.

## Screenshots

![Dashboard](./docs/images/dashboard.png)
*Modern task dashboard with sliding toggles and deep editing.*

![History](./docs/images/history.png)
*Compact history view with bulk actions and status indicators.*

![Settings](./docs/images/settings.png)
*Simplified settings panel with autoconnecting monitor console.*

## Getting Started

### Prerequisites

- Docker and Docker Compose installed.

### Deployment

1. Clone the repository to your NAS.
2. Edit `docker-compose.yml` and set your `ARIA2_RPC_SECRET`.
3. Start the stack:
   ```bash
   docker-compose up -d --build
   ```
4. Access the Web UI at `http://<your-nas-ip>:8000`.

## Using an External Downloader

If you prefer to use an existing Aria2 instance on your NAS, simply go to **"Settings"**, update the RPC Endpoint (e.g., `http://192.168.1.100:6800/jsonrpc`), and save. The tool will instantly switch to your external downloader.

## Performance Tips

To get the best download speeds, we recommend forwarding port `51413` (TCP/UDP) on your router to your NAS IP. The tool automatically maintains a fresh Tracker list to keep your connections healthy.

## License

MIT
