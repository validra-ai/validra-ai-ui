# Validra UI

Visual interface for [Validra](https://github.com/validra-ai/validra-ai-core) — AI-powered API test generation and validation.

---

## Quick Start

**Prerequisites**: Node.js 20+, [validra-core](https://pypi.org/project/validra) running

```bash
npm install -g @validra-ai/ui
validra-ui
```

Open **http://localhost:3000** in your browser.

Validra UI connects to `http://localhost:8000` by default (where `validra` runs). To point it at a different address:

```bash
validra-ui --api http://myserver:8000
# or
VALIDRA_API_URL=http://myserver:8000 validra-ui
```

To use a custom port for the UI:

```bash
validra-ui --port 4000
```

---

## Running the full stack locally

```bash
# Terminal 1 — start the core API
pip install validra
validra

# Terminal 2 — start the UI
npm install -g @validra-ai/ui
validra-ui
```

---

## Development

```bash
npm install
npm run dev        # starts Vite dev server on http://localhost:3000
```

The dev server proxies `/generateAndRun` and `/validate` to `http://localhost:8000` by default. To change the backend target during development:

```bash
VALIDRA_API_URL=http://myserver:8000 npm run dev
```

---

## What it does

### Configuration panel (left)

| Section | Description |
|---|---|
| **Endpoint** | Target URL and HTTP method |
| **Headers** | Custom request headers |
| **Payload** | JSON body used as base for test generation |
| **Payload Meta** | Field constraints (e.g. `"required, alphanumeric, [3-20] chars"`) that guide the LLM |
| **Test Type** | `FUZZ`, `AUTH`, or `PEN` |
| **Max Cases** | Number of test cases to generate (3–100) |
| **LLM Provider** | Ollama (local), OpenAI, or Anthropic |
| **Provider Override** | Per-request model / temperature / API key overrides |

### Test types

| Type | Purpose |
|---|---|
| **Fuzz** | Edge cases and invalid inputs — empty values, boundary conditions, type mismatches |
| **Auth** | Authentication probes — missing tokens, expired credentials, malformed headers |
| **Pen** | Penetration probes — injection, privilege escalation, parameter pollution |

### Results panel (right)

- **Summary bar** — total, passed, failed, duration
- **Filter pills** — PASS / FAIL / WARN / No Validation / All
- **Test cards** — payload, HTTP status, response body, duration, validation verdict
- **Export JSON** — download full results as `.json`

### History tab

Completed runs are saved to `localStorage`. Browse past runs, reload a previous configuration, or delete entries.

---

## Project structure

```
src/
  components/
    config/      # Left panel: endpoint, headers, payload, meta, options, provider
    results/     # Right panel: summary bar, test cards, results panel
    history/     # History tab
  hooks/
    useTestRun.ts   # Backend calls, loading/error state
    useHistory.ts   # localStorage persistence
  services/
    api.ts          # Fetch client + SSE streaming
  types/
    index.ts        # Shared TypeScript types
  App.tsx
bin/
  serve.js          # Production server (static files + API proxy)
```
