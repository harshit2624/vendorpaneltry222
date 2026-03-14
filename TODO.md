# Shopify Vendor Panel - Orders Fetching Implementation

## Approved Plan Steps
1. [x] Create backend/.env with provided Shopify credentials.
2. [x] Edit backend/server.js: Add Shopify instance, /api/setup (token), /api/orders endpoints.
3. [x] Edit frontend/src/App.jsx: Add form for creds (temp), login/fetch token, display orders table.
4. [x] Install dependencies: backend/frontend.
5. [x] Test: Run servers, fetch orders via frontend (user to run: cd backend && node server.js | cd frontend && npm run dev). Servers running: Backend port 8080, Frontend http://localhost:5173/.
6. [x] [Complete] Secure/clean up (remove temp form, use sessions). Initial implementation functional—token fetched, orders displayed.
