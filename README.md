# Validra AI — Test Studio UI

A React-based front-end for **Validra AI**, a tool that uses LLMs to automatically generate and execute API test cases (fuzz, auth, and penetration tests) against any HTTP endpoint.

---

## Prerequisites

- A running **Validra AI backend** reachable at a known URL (default: `http://localhost:8000`)
- **Docker** (recommended) — or Node.js 20+ for local development

---

## Run with Docker (recommended)

### 1. Set the backend URL

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 2. Start the container

```bash
docker compose up --build
```

The UI is served at **http://localhost:3000**.

To pass the backend URL inline without editing `.env`:

```bash
VITE_API_URL=http://my-backend-host:8000 docker compose up --build
```

> **Note:** `VITE_API_URL` is baked into the static build at image build time. Changing it after the image is built requires a rebuild (`--build`).

---

## Run locally (optional)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` to your backend URL.

### 3. Start the dev server

```bash
npm run dev
```

The app is served at **http://localhost:5173** (Vite default).

### 4. Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

---

## How it works

### Configuration panel (left sidebar)

| Section | Description |
|---|---|
| **Endpoint** | Target URL and HTTP method (GET / POST / PUT / PATCH / DELETE) |
| **Headers** | Custom request headers (key-value pairs) |
| **Payload** | JSON body to use as the base for generated test cases |
| **Payload Meta** | Human-readable field constraints (e.g. `"required, alphanumeric, [3-20] chars"`) that guide the LLM when mutating values |
| **Test Type** | Strategy used for test case generation (see below) |
| **Max Cases** | Number of test cases to generate (3–100, slider) |
| **LLM Provider** | Which LLM backend generates and validates tests |
| **Provider Override** | Optional model / temperature / max_tokens / API key overrides |

### Test types

| Type | Purpose |
|---|---|
| **Fuzz** | Input validation edge cases — empty values, boundary conditions, wrong types |
| **Auth** | Authentication & authorization probes — missing tokens, role escalation |
| **Pen** | Penetration probes — SQL injection, XSS, path traversal, command injection |

### LLM providers

| Provider | Default model | Notes |
|---|---|---|
| **Ollama** (local) | `llama3:8b-instruct-q4_0` | Requires a local Ollama instance; configure URL override if not on `localhost:11434` |
| **OpenAI** | `gpt-4o` | Requires an API key |
| **Anthropic** | `claude-sonnet-4-6` | Requires an API key |

Enable **Validate test results with LLM** to have the selected provider score each test result (PASS / WARN / FAIL) with a confidence score and reasoning.

### Results panel (right area)

- **Summary bar** — total tests, passed, failed, total duration
- **Filter pills** — filter by PASS / FAIL / WARN / No Validation / All
- **Test cards** — expandable cards showing generated payload, HTTP status, response body, duration, and validation verdict
- **Export JSON** — download the full results object as a `.json` file

### History tab

Completed runs are saved to `localStorage`. Click **History** to browse past runs, reload a previous configuration, or delete individual entries.

---

## Project structure

```
src/
  components/
    config/      # Left panel: endpoint, headers, payload, meta, test options, provider
    results/     # Right panel: summary bar, test cards, results panel
    history/     # History tab
  hooks/
    useTestRun.ts   # Calls the backend, manages loading/error state
    useHistory.ts   # localStorage persistence for past runs
  services/
    api.ts          # Axios client
  types/
    index.ts        # Shared TypeScript types
  App.tsx           # Root layout and tab routing
```
