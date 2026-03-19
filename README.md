# Mino — Vehicle Scout

Multi-platform used vehicle search powered by [tinyfish.ai](https://tinyfish.ai).

Searches OLX, Craigslist, Cars.com, CarGurus, AutoTrader and CarBuzz simultaneously — filtered by model, budget, year, location, and mileage.

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Leave all settings as default → click **Deploy**

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full frontend UI |
| `server.js` | Tinyfish proxy (Vercel serverless function) |
| `vercel.json` | Routes `/proxy` → serverless, `/` → static HTML |
| `package.json` | Node metadata |
