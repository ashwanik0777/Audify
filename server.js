const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let tokenCache = {
  accessToken: null,
  expiresAt: 0
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function getLocalPlaylists() {
  const songsDir = path.join(__dirname, "songs");
  if (!fs.existsSync(songsDir)) {
    return [];
  }

  const folders = fs.readdirSync(songsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith("."))
    .map(dirent => dirent.name);

  const playlists = [];

  for (const folder of folders) {
    const folderPath = path.join(songsDir, folder);
    let title = folder;
    let description = "Local Playlist";

    const infoPath = path.join(folderPath, "info.json");
    if (fs.existsSync(infoPath)) {
      try {
        const infoData = JSON.parse(fs.readFileSync(infoPath, "utf8"));
        if (infoData.title) title = infoData.title;
        if (infoData.description) description = infoData.description;
      } catch (e) {
        console.error(`Error reading info.json in ${folder}:`, e.message);
      }
    }

    let cover = "/img/playlist.svg";
    const possibleCovers = ["cover.jpeg", "cover.jpg", "cover.png", "cover.webp"];
    for (const coverName of possibleCovers) {
      if (fs.existsSync(path.join(folderPath, coverName))) {
        cover = `/songs/${encodeURIComponent(folder)}/${encodeURIComponent(coverName)}`;
        break;
      }
    }

    const files = fs.readdirSync(folderPath);
    const audioExtensions = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"];
    const tracks = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (audioExtensions.includes(ext)) {
        const trackTitle = path.basename(file, path.extname(file));
        tracks.push({
          title: trackTitle,
          artist: title,
          audioUrl: `/songs/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
        });
      }
    }

    if (tracks.length > 0) {
      playlists.push({
        id: `local-${folder}`,
        title: title,
        description: description,
        cover: cover,
        embedUrl: null,
        tracks: tracks
      });
    }
  }

  return playlists;
}

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 10000) {
    return tokenCache.accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing Spotify client credentials.");
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token request failed: ${text}`);
  }

  const data = await response.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000
  };

  return tokenCache.accessToken;
}

async function proxySpotify(res, endpoint) {
  const token = await getAccessToken();
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const text = await response.text();
  if (!response.ok) {
    sendError(res, response.status, text);
    return;
  }

  try {
    const data = JSON.parse(text);
    sendJson(res, 200, data);
  } catch (error) {
    sendError(res, 500, "Invalid Spotify response.");
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    });
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendError(res, 405, "Method not allowed.");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  const albumMatch = pathname.match(/^\/api\/albums\/([^/]+)$/);
  const tracksMatch = pathname.match(/^\/api\/albums\/([^/]+)\/tracks$/);

  try {
    if (pathname === "/api/local/playlists") {
      const playlists = getLocalPlaylists();
      sendJson(res, 200, { items: playlists });
      return;
    }

    if (albumMatch) {
      const albumId = albumMatch[1];
      const market = url.searchParams.get("market") || "ES";
      const endpoint = `https://api.spotify.com/v1/albums/${albumId}?market=${market}`;
      await proxySpotify(res, endpoint);
      return;
    }

    if (tracksMatch) {
      const albumId = tracksMatch[1];
      const market = url.searchParams.get("market") || "ES";
      const limit = url.searchParams.get("limit") || "10";
      const offset = url.searchParams.get("offset") || "0";
      const endpoint = `https://api.spotify.com/v1/albums/${albumId}/tracks?market=${market}&limit=${limit}&offset=${offset}`;
      await proxySpotify(res, endpoint);
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendError(res, 404, "API Route not found.");
      return;
    }

    let filePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
    let absPath = path.join(__dirname, filePath);

    if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
      absPath = path.join(absPath, "index.html");
    }

    if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
      const ext = path.extname(absPath).toLowerCase();
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4"
      };
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*"
      });
      const readStream = fs.createReadStream(absPath);
      readStream.pipe(res);
      return;
    }

    sendError(res, 404, "Route not found.");
  } catch (error) {
    sendError(res, 500, error.message || "Server error.");
  }
});

server.listen(PORT, () => {
  console.log(`Spotify proxy listening on http://localhost:${PORT}`);
});
