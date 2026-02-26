# 动漫花园RSS订阅工具 (Anime Garden RSS Subscription Tool)

[English](./README.md) | 中文说明

这是一个专为 NAS 环境设计的轻量化 Web 工具，旨在自动化从 `animes.garden` RSS 订阅源下载番剧。它可以监控订阅源、根据关键字（如“简繁内封”）进行过滤，并自动将磁力链接提交给 Aria2。

## 核心特性

- **智能订阅管理**：添加动漫 RSS 订阅源并自定义追踪规则。
- **高级关键字过滤**：支持包含或排除关键字（如：`简繁内封`, `1080P`），精准锁定所需资源。
- **灵活的同步模式**：
  - **全量模式 (Archive)**：自动下载当前 RSS 中所有符合条件的条目。
  - **追踪模式 (Monitor)**：仅记录当前状态，仅下载未来发布的更新集数。
- **Aria2 深度联动**：通过 JSON-RPC 自动提交下载任务。
- **全自动后台监控**：每 10 分钟自动检查一次更新，无需人工干预。
- **现代 Web UI**：基于 React、Tailwind CSS 和 Lucide 图标构建的简洁仪表盘。
- **Docker 化部署**：支持 `docker-compose` 一键启动。

## 技术栈

- **前端**：React (TypeScript), Tailwind CSS, TanStack Query。
- **后端**：FastAPI (Python), SQLAlchemy, APScheduler。
- **数据库**：SQLite (轻量且便携)。
- **下载器**：Aria2 (通过 RPC 协议)。

## 快速开始

### 前提条件

- 已安装 Docker 和 Docker Compose。

### 部署步骤

1. 将仓库克隆到你的 NAS：
   ```bash
   git clone https://github.com/juju-w/nas_anime_garden_sub.git
   cd nas_anime_garden_sub
   ```
2. 编辑 `docker-compose.yml`，设置你的 `ARIA2_RPC_SECRET`。
3. 启动服务：
   ```bash
   docker-compose up -d
   ```
4. 通过浏览器访问 Web 界面：`http://<你的-NAS-IP>:8000`。

### 性能优化建议

为了获得最佳的 BT 下载速度：
1. **端口转发**：建议在路由器上将 `51413` 端口（TCP 和 UDP）转发到你的 NAS 内部 IP。
2. **自动更新 Tracker**：本工具已配置 `UPDATE_TRACKERS=true`，容器每次启动时都会自动获取全球最新的 Tracker 列表。
3. **磁盘缓存**：默认配置了 64M 缓存以减少对 NAS 硬盘的读写压力。
- **关键字设置**：使用英文逗号分隔多个关键字（例如：`简繁内封, 1080P`）。
- **初始同步**：如果你想下载 RSS 中已经存在的集数，请在添加时勾选 "Download historical episodes"。

## 开源协议

MIT
