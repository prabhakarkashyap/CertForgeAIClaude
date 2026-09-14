# LLM Provider Design

## 1. Goals

- No provider-specific logic outside `packages/llm-gateway`.
- A user-supplied API key is encrypted at rest and never returned in full
  after it is saved.
- Adding a new OpenAI-compatible endpoint should not require new code, only
  a `baseUrl`.

## 2. The gateway contract

`packages/shared/src/llm.ts` defines the provider-neutral contracts:
`LLMProvider`, `LLMProviderConfig`, `LLMProviderConfigInput`,
`LLMStructuredRequest`/`Response`, `LLMProviderTestResult`. Every adapter in
`packages/llm-gateway/src/providers/*.ts` implements `LLMProvider`.
`LLMGateway` (`packages/llm-gateway/src/gateway.ts`) is the single entry
point the rest of the app calls: `gateway.testConnection(kind, config)` and
`gateway.generateStructured(kind, config, request)`. Nothing outside
`llm-gateway` imports a concrete adapter directly.

## 3. Adapters (V1)

| Provider | Wire format | Notes |
|---|---|---|
| `anthropic` | Messages API (`/v1/messages`) | `x-api-key` + `anthropic-version` headers |
| `openai` | Chat Completions (`/chat/completions`) | Bearer token |
| `google` | Generative Language API (`generateContent`) | API key as query param |
| `openrouter` | OpenAI-compatible | Same adapter code as `openai`, different `baseUrl` |
| `custom` | OpenAI-compatible | Same adapter code as `openai`, user-supplied `baseUrl` |

`testConnection` issues a minimal request (1 output token) and reports
`{ ok, latencyMs, modelConfirmed, message }` without ever throwing a raw
provider error message that could contain the key.

A `mockProvider` (`packages/llm-gateway/src/providers/mock.ts`) makes no
network calls and is used in every automated test that needs a "provider" -
see NFR/testing requirement: never call real LLM APIs in unit tests.

## 4. Credential encryption

- Algorithm: AES-256-GCM (authenticated encryption), implemented in
  `packages/llm-gateway/src/security/encryption.ts`.
- Every encryption call generates a fresh random 12-byte IV; the encoded
  payload is `v1:<iv>:<authTag>:<ciphertext>` (all base64), so the format
  can be versioned if the scheme changes later.
- `maskSecret()` produces a short, non-reversible preview (e.g.
  `sk-...ab12`) - this is the *only* representation of a saved key that
  ever reaches the UI or logs.

## 5. Master key resolution

`packages/llm-gateway/src/security/master-key.ts#resolveMasterKey`:

1. If `APP_ENCRYPTION_KEY` is set in the environment, use it.
2. Otherwise, read `<APP_DATA_DIR>/app-secret.key` if it already exists.
3. Otherwise, generate a new 256-bit key, write it to
   `<APP_DATA_DIR>/app-secret.key` with owner-only permissions (`0600`),
   and use it.

This file is git-ignored and must never be logged. `apps/web/src/lib/
security.ts` caches the resolved key (and its origin, for the Security
admin screen) for the process lifetime. Migrating this to an OS
keychain/credential manager is planned once desktop packaging exists
(PRD section 17 / roadmap).

## 6. What is NOT yet implemented

`generateStructured()` is implemented per-adapter (real HTTP calls) but is
not yet wired into a generation pipeline - that is Phase 4
(`packages/question-engine`). Phase 1 only exercises `testConnection()`
through the setup wizard and the admin Providers screen.
