# Validra AI — Test Studio UI

A React-based front-end for **Validra AI**, a tool that uses LLMs to automatically generate and execute API test cases (fuzz, auth, and penetration tests) against any HTTP endpoint.

---

## Requirements

- Node.js 20+
- A running [Validra AI backend](http://localhost:8000) (provides `/generateAndRun` and `/validate` endpoints)
- (Optional) Docker & Docker Compose for containerised deployment

---

## Getting started

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and point `VITE_API_URL` to your backend:

```env
VITE_API_URL=http://localhost:8000
```

### 2. Run in development

```bash
npm install
npm run dev
```

The app is served at `http://localhost:5173` (Vite default).

### 3. Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

### 4. Run with Docker Compose

```bash
docker compose up --build
```

The app is served at `http://localhost:3000` via nginx.

To override the backend URL at runtime:

```bash
VITE_API_URL=http://my-api-host:8000 docker compose up --build
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

Enable **LLM Validate** to have the selected provider score each test result (PASS / WARN / FAIL) and provide a confidence score and reasoning.

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
    useTestRun.ts   # Calls /generateAndRun, manages loading/error state
    useHistory.ts   # localStorage persistence for past runs
  services/
    api.ts          # Axios client — generateAndRun() and validateSingle()
  types/
    index.ts        # Shared TypeScript types
  App.tsx           # Root layout and tab routing
```

---

## API contract (backend)

### `POST /generateAndRun`

Request body: `TestRequest`

```json
{
  "endpoint": "https://api.example.com/users",
  "method": "POST",
  "headers": { "Content-Type": "application/json" },
  "payload": { "username": "john", "age": 25 },
  "payload_meta": { "username": "required, alphanumeric, [3-20] chars", "age": "required, numeric, [0-120]" },
  "test_type": "FUZZ",
  "max_cases": 10,
  "validate": true,
  "provider": "ollama"
}
```

Response: `GenerationResponse` — `{ tests: TestResult[], summary: Summary }`

### `POST /validate`

Validates a single test result and returns a `ValidationResult` with `dstatus` (PASS/FAIL/WARN), `reason`, and `confidence`.
