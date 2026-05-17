const http = require("http");
const { URL } = require("url");
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
  const path = url.pathname;

  const albumMatch = path.match(/^\/api\/albums\/([^/]+)$/);
  const tracksMatch = path.match(/^\/api\/albums\/([^/]+)\/tracks$/);

  try {
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

    sendError(res, 404, "Route not found.");
  } catch (error) {
    sendError(res, 500, error.message || "Server error.");
  }
});

server.listen(PORT, () => {
  console.log(`Spotify proxy listening on http://localhost:${PORT}`);
});
