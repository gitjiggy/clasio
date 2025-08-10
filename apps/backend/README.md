# Backend (Mock SSE + API)

Minimal Node HTTP server exposing:
- `GET /health`
- `GET /asset/:symbol/quote`
- `GET /portfolio/:id/summary`
- `POST /ai/optimize`
- `POST /backtest/run`
- `GET /sse/quotes?symbols=AAPL,MSFT`

Run:
```bash
node server.js
```
