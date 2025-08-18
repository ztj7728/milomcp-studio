# Project Overview

This is a frontend application for the MiloMCP management studio. It's built as a high-performance, elegant, and lightweight interface.

**Key Technologies:**

*   **Framework:** Vue.js 3
*   **Build Tool:** Vite
*   **Routing:** Vue Router
*   **State Management:** Pinia
*   **UI Library:** Element Plus
*   **HTTP Client:** Axios

**Architecture:**

The application is a single-page application (SPA). The entry point is `src/main.js`, which sets up the Vue app, router, Pinia store, and Element Plus UI library.

The code is organized into the following directories:

*   `src/api`: Contains the API client for making requests to the backend.
*   `src/components`: Contains reusable Vue components.
*   `src/stores`: Contains Pinia stores for managing application state (e.g., authentication, UI).
*   `src/views`: Contains the main pages or views of the application (e.g., Login, Dashboard).

The Vite configuration (`vite.config.js`) is set up to proxy API requests from `/api` to a backend server running at `http://localhost:3000`.

# Building and Running

**Development:**

To run the development server:

```bash
npm run dev
```

This will start the server on `http://localhost:5173`.

**Building for Production:**

To build the application for production:

```bash
npm run build
```

The output will be in the `dist` directory.

**Previewing the Production Build:**

To preview the production build locally:

```bash
npm run preview
```

# Development Conventions

*   **Styling:** The project uses the Element Plus component library for UI elements.
*   **State Management:** Global application state is managed using Pinia. Stores are defined in the `src/stores` directory.
*   **Routing:** Page routing is handled by Vue Router. Route definitions and navigation guards are in `src/main.js`.
*   **API Requests:** Backend API requests are made using an Axios client defined in `src/api/client.js`.
*   **Code Style:** While no specific linter configuration is present, the code follows standard JavaScript and Vue.js conventions.
