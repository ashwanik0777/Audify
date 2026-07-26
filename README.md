<div align="center">

# 🎧 Audify - Next-Gen Hybrid Music Player

**A sleek, responsive, and ultra-modern web music player powered by the Spotify Web API and an automated Offline Local Music Engine.**

[![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Spotify API](https://img.shields.io/badge/Spotify_API-OAuth_2.0-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com/documentation/web-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 Overview

**Audify** is a state-of-the-art music streaming application built for speed, aesthetics, and reliability. Designed with a **Glassmorphic UI** and rich animations, it delivers a seamless audio experience across desktop and mobile devices. 

What sets Audify apart is its **Dual-Mode Hybrid Architecture**:
1. **Live Cloud Streaming**: Fetches curated album data, high-resolution cover artwork, and 30-second audio previews directly from the **Spotify Web API** via a custom Node.js backend proxy.
2. **Offline Local Fallback Engine**: When the Spotify API is rate-limited, offline, or unavailable, Audify's automated fallback engine immediately kicks in—scanning local directories, reading metadata, and serving full-length MP3 tracks without missing a beat.

---

## ✨ Key Features

- 🎧 **Hybrid Audio Engine**: Seamless transition between live Spotify API streaming and local file playback.
- 🎨 **Modern Premium Design**: Crafted with Tailwind CSS, featuring dark-mode aesthetics, custom seekbar scrubbers, and smooth hover micro-animations.
- ⚡ **Lightning Fast HMR**: Powered by **Vite** for instantaneous development server reloads and optimized production bundling.
- 🛡️ **Secure Backend Proxy**: Custom Node.js HTTP proxy server (`server.js`) that handles Spotify OAuth 2.0 `client_credentials` token caching, keeping your API secrets completely secure from client-side exposure.
- 📂 **Dynamic Local Music Library**: The server automatically scans folder structures inside `/songs`, extracting track titles, artist metadata (`info.json`), and cover art (`cover.jpeg`).
- 🪟 **Integrated Spotify Embeds**: Built-in interactive modal allows users to launch official Spotify web embeds directly inside the application for full album streaming.
- 📱 **Fully Responsive Layout**: Intuitive mobile drawer navigation with hamburger toggles and adaptive grid layouts.
- 🔊 **Advanced Audio Controls**: Real-time progress bar scrubbing, duration formatting, track navigation (Next/Prev), and dynamic SVG volume controls (Mute/Mid/Max).

---

## 🏗️ System Architecture

```text
+-------------------------------------------------------------------------+
|                              AUDIFY CLIENT                              |
|                    (Vite / Tailwind CSS / Vanilla JS)                   |
+------------------------------------+------------------------------------+
                                     |
                                     | REST API / Static Assets
                                     v
+------------------------------------+------------------------------------+
|                         NODE.JS PROXY SERVER                            |
|                       (HTTP Server on Port 4000)                        |
+------------------------------------+------------------------------------+
                   /                                   \
  [Live API Mode] /                                     \ [Fallback / Offline Mode]
                 v                                       v
+------------------------------------+   +------------------------------------+
|          SPOTIFY WEB API           |   |       LOCAL MUSIC LIBRARY          |
|    (OAuth 2.0 Token Caching)       |   |   (/songs directory filesystem)    |
+------------------------------------+   +------------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5, Vanilla JavaScript (ES6+) | Application logic, DOM manipulation, HTML5 Audio API |
| **Styling & UI** | Tailwind CSS v3.4, PostCSS | Utility-first responsive design, modern animations |
| **Build Tool** | Vite v6.0 | Ultra-fast development server and production bundler |
| **Backend Proxy** | Node.js (`http`, `url`, `fs`, `path`) | REST API proxy, static asset serving, directory scanner |
| **Authentication** | OAuth 2.0 Client Credentials | Spotify API authentication & token caching |
| **Environment** | Dotenv (`.env`) | Managing sensitive API credentials |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js)
- A free **Spotify Developer Account** (for live cloud streaming)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ashwanik0777/Audify.git
cd Audify
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory by copying the example structure (or create a new `.env` file):

```env
# Spotify Developer API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Backend Proxy Port (Default: 4000)
PORT=4000
```
> **Note:** To get your Spotify credentials, visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), create an application, and copy your `Client ID` and `Client Secret`.

### 3. Run Development Servers
Audify requires both the **Backend Proxy Server** and the **Vite Frontend Dev Server** to run simultaneously. Open two terminal tabs:

**Terminal 1 — Start the Backend Proxy Server:**
```bash
npm run server
# Output: Spotify proxy listening on http://localhost:4000
```

**Terminal 2 — Start the Frontend UI:**
```bash
npm start
# Output: Vite server ready at http://localhost:5173
```
Now, open `http://localhost:5173` in your browser to experience Audify! 🎉

---

## 📜 NPM Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm start` | `vite` | Starts the frontend Vite development server with Hot Module Replacement. |
| `npm run server` | `node server.js` | Starts the Node.js backend proxy & local music discovery server on port `4000`. |
| `npm run build` | `vite build` | Generates an optimized, minified production build in the `/dist` directory. |

---

## 📂 Local Music Library Guide (Offline Fallback)

Audify includes an intelligent local directory scanner. When API credentials are omitted or network errors occur, the player automatically switches to your local `/songs` folder.

### Adding Custom Playlists & Songs
To add your own offline playlists, structure your `/songs` directory as follows:

```text
Audify/
└── songs/
    ├── YOUR_PLAYLIST_NAME/
    │   ├── info.json          # Playlist metadata
    │   ├── cover.jpeg         # Album artwork (supports .jpeg, .jpg, .png, .webp)
    │   ├── track_one.mp3      # Audio files (.mp3, .wav, .m4a, .aac, .flac)
    │   └── track_two.mp3
```

### Formatting `info.json`
Create an `info.json` file inside your playlist folder to define custom metadata:
```json
{
    "title": "My Awesome Playlist",
    "description": "Curated lofi and ambient beats for deep focus.",
    "artist": "Various Artists"
}
```

---

## 📡 API Endpoints Reference

The local Node.js proxy server (`http://localhost:4000`) exposes the following endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/albums/:id` | Proxies request to Spotify API for album details (uses cached OAuth token). |
| `GET` | `/api/albums/:id/tracks` | Fetches tracklist and 30-second MP3 preview URLs from Spotify. Supports `limit` & `offset` params. |
| `GET` | `/api/local/playlists` | Scans the local `/songs` directory and returns all offline playlists, artwork URLs, and audio paths. |
| `GET` | `/*` | Static file fallback serving for media, images, and HTML assets. |

---

## 🎮 Player Controls & UI Guide

- **▶️ Play / ⏸️ Pause**: Click the floating play button on any playlist card or the master control bar at the bottom.
- **⏮️ Previous / ⏭️ Next**: Navigate seamlessly through tracks in the active playlist. Auto-advances on track completion.
- **🎯 Interactive Seekbar**: Click or drag anywhere along the bottom progress bar to jump to specific timestamps.
- **🔊 Dynamic Volume Slider**: Adjust audio levels smoothly. The volume icon dynamically changes between muted, low/mid, and max states. Click the icon for instant mute/unmute.
- **🪟 Spotify Web Embeds**: Hover over a playlist card and click the green embed button to launch the official interactive Spotify player modal.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Author

**Ashwani Kushwaha**
- GitHub: [@ashwanik0777](https://github.com/ashwanik0777)
- Project Link: [Audify Repository](https://github.com/ashwanik0777/Audify)

---

<div align="center">
  <p>Made with ❤️ for music lovers and developers.</p>
</div>
