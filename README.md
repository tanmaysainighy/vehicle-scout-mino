# Mino — Vehicle Scout

Multi-platform used vehicle search powered by [tinyfish.ai](https://tinyfish.ai).

Searches OLX, Craigslist, Cars.com, CarGurus, AutoTrader and CarBuzz simultaneously — filtered by model, budget, year, location, and mileage.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full frontend UI |
| `server.js` | Tinyfish proxy (Vercel serverless function) |
| `vercel.json` | Routes `/proxy` → serverless, `/` → static HTML |
| `package.json` | Node metadata |
