# Todo Frontend (React + Supabase REST)

A lightweight React todo app styled with the "Ocean Professional" guide and backed by Supabase via its REST API.

## Features
- Add, edit, delete tasks
- Persist and sync tasks with Supabase
- Centered card layout, modern accents, subtle gradients and shadows

## Quick Start
1) Copy `.env.example` to `.env` and fill in:
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...
```
2) Start the app:
```
npm start
```

## Supabase Setup
See `assets/supabase.md` for required table schema, permissive development policies, and REST endpoints used.

## Design
Colors and layout are defined in `src/App.css` following the Ocean Professional theme:
- primary: #2563EB
- secondary: #F59E0B
- error: #EF4444
- background: #f9fafb
- surface: #ffffff
- text: #111827
