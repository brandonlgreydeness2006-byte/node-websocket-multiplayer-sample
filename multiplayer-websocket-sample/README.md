# Node + WebSocket Multiplayer Technical Sample

A small technical sample built to demonstrate basic real-time multiplayer programming.

## What it demonstrates

- Node.js HTTP server
- WebSocket connections using `ws`
- Server-authoritative shared player state
- Join and disconnect handling
- Live movement synchronization
- Basic server-side input validation
- Player-name updates
- Simple browser client

## Run

```bash
npm install
npm start
```

Open `http://localhost:8080` in two browser tabs and move each player with WASD or the arrow keys.

## Notes

This is intentionally a small demonstration rather than a production game. A production implementation would normally add authentication, rate limiting, stronger protocol validation, interpolation/prediction, persistence, tests and deployment configuration.
