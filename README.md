# f-siasus-dw

Frontend dashboard built with React + TypeScript + Vite to consume the SIA/SUS Data Warehouse API.

The application focuses on:

- Secure login with API key + Bearer token
- Cached dashboard data for fast page reloads
- KPI cards and charts on the home page
- Centralized filters loaded from `/api/dim/filtros`

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Axios
- Recharts
- React Router DOM

## Features

- Session persistence with token validation (`/api/me`)
- Logout with session cleanup
- Local cache strategy for API responses
- Manual data refresh flow
- Home charts generated from cached data
- Filter UI hydrated from backend filter payload

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=/api
VITE_API_KEY=your-api-key
```

Notes:

- `VITE_API_URL=/api` is used with Vite proxy in local development.
- `VITE_API_KEY` is sent in `X-API-KEY` for all API requests.

## Run Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## API Contract Used by Frontend

### Auth

- `POST /api/login`
- `GET /api/me`
- `POST /api/logout`

### Dashboard

- `GET /api/producao/resumo`
- `GET /api/producao/por-competencia`
- `GET /api/producao/por-municipio`

### Dimensions / Filters

- `GET /api/dim/filtros`

The filter bar consumes the `selects` and `inputs` payload to render options for:

- `competencia_inicio`
- `competencia_fim`
- `uf`
- `codigo_mun`
- `cod_procedimento`
- `codigo_cbo`
- `cnes`
- `ano`
- `min_valor`
- `max_valor`

## Caching Strategy

Two cache layers are used:

1. Generic API cache in `localStorage` (keyed by endpoint + params + token)
2. Home view cache (dedicated keys for cards and chart datasets)

Behavior:

- On page load, home reads cached data first.
- If no cache exists, first load can seed data from API.
- API calls are forced only when user clicks `Atualizar dados`.

## Project Structure

```text
src/
  components/
    layout/
    ui/
  contexts/
  pages/
  services/
  types/
  utils/
```

## Security Notes

- Token is stored in `sessionStorage`.
- Cached analytical data is stored in `localStorage`.
- On unauthorized (`401`), auth session is cleared and user is redirected to login.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
