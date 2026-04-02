export type TestType = 'FUZZ' | 'AUTH' | 'PEN'
export type Provider = 'ollama' | 'openai' | 'anthropic'
export type DStatus = 'PASS' | 'FAIL' | 'WARN'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ProviderConfig {
  model?: string
  temperature?: number
  max_tokens?: number
  url?: string
  api_key?: string
}

export interface TestRequest {
  endpoint: string
  method: HttpMethod
  headers: Record<string, string>
  payload: Record<string, unknown>
  payload_meta: Record<string, string>
  test_type: TestType
  max_cases: number
  run_validation: boolean
  provider: Provider
  provider_config?: ProviderConfig
}

export interface ValidationResult {
  dstatus: DStatus
  reason: string
  confidence: number
}

export interface TestResult {
  id: string
  description?: string
  request: {
    payload?: Record<string, unknown>
    headers?: Record<string, string>
  }
  response: {
    status_code: number
    body?: unknown
    error?: string
  }
  success: boolean
  duration_ms: number
  validation?: ValidationResult
}

export interface Summary {
  total: number
  success: number
  failed: number
  total_duration_ms: number
}

export interface GenerationResponse {
  tests: TestResult[]
  summary: Summary
}

export interface SavedRun {
  id: string
  label: string
  timestamp: number
  request: TestRequest
  response: GenerationResponse
}

export type SSEPhase = 'warming_up' | 'generating' | 'executing' | 'validating' | 'result' | 'done' | 'cancelled' | 'error'

export interface SSEEvent {
  phase: SSEPhase
  run_id?: string
  progress?: number
  total?: number
  result?: TestResult
  summary?: Summary
  message?: string
}

export interface ProgressState {
  phase: 'warming_up' | 'generating' | 'executing' | 'validating'
  current: number    // which test is being worked on (1-based)
  total: number      // total number of tests
  completed: number  // how many test results have been received
}
