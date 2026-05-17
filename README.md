# Audify - Minimalist Music Player

Audify is a clean and responsive music player built with HTML, Tailwind CSS, and vanilla JavaScript. The app loads playlist data from the Spotify Web API through a small local proxy server.

## Features

- Minimal UI with responsive layout
- Playlist cards and track list
- Play, pause, next, previous, seek, and volume control
- Optional embed modal per playlist

## Run Locally

This project uses Vite for the UI and a Node proxy for Spotify API requests.

```bash
npm install
npm run server
npm run start
```

Open the local URL shown in your terminal. Opening index.html directly in the browser will not work because playlist data is loaded with fetch.

## Spotify Setup

1) Create an app at https://developer.spotify.com/dashboard
2) Copy your Client ID and Client Secret
3) Create a .env file based on .env.example and add:

SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

The proxy runs on http://localhost:4000 and exposes:

- GET /api/albums/:id
- GET /api/albums/:id/tracks

## Playlist Data

## Playlist Data

The UI reads album configurations from script.js. Update ALBUM_CONFIGS to show multiple playlists:

- id
- market
- limit
- offset

## Tech Stack

- HTML5
- Tailwind CSS
- JavaScript (vanilla)

## License

This project is open source. Add a license file if you want to define usage terms.

## Author

Ashwani Kushwaha
