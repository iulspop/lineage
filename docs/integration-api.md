# Lineage Memory Integration API

Version 1 lets an approved external application connect a Lineage account and create atomic basic or cloze Memories in the user’s currently active workspace.

The API does not expose corpus contents, answers, review history, scheduling state, sources, or assets. Image occlusion, collections, arbitrary corpus import, and caller-supplied durable IDs are not supported.

## Authorization server

Discover endpoints from:

```text
GET /.well-known/oauth-authorization-server
```

Lineage uses an OAuth 2.1-style authorization-code flow:

- exact registered redirect URI matching;
- mandatory `state`;
- mandatory PKCE using `S256`;
- scope `memories:write`;
- five-minute, single-use authorization codes;
- opaque short-lived access tokens;
- rotating refresh tokens;
- immediate grant revocation.

All public endpoint URLs are derived from the server’s trusted `APP_URL`.

### Authorization request

```text
GET /oauth/authorize
  ?response_type=code
  &client_id=CLIENT_ID
  &redirect_uri=REGISTERED_REDIRECT_URI
  &scope=memories%3Awrite
  &state=OPAQUE_APPLICATION_STATE
  &code_challenge=BASE64URL_SHA256_VERIFIER
  &code_challenge_method=S256
```

Lineage authenticates the user, shows the requesting application and direct-write consequence, and requires an explicit Allow or Deny decision. The redirect includes the original `state` plus either `code` or `error=access_denied`.

### Token exchange

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

 grant_type=authorization_code&client_id=CLIENT_ID&code=CODE&redirect_uri=REGISTERED_REDIRECT_URI&code_verifier=VERIFIER
```

Confidential clients authenticate with HTTP Basic or their registered client credentials. Public clients send `client_id`. A successful response contains `access_token`, `refresh_token`, `token_type`, `expires_in`, and `scope`.

Refresh with:

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

 grant_type=refresh_token&client_id=CLIENT_ID&refresh_token=REFRESH_TOKEN
```

Every successful refresh rotates the refresh token. Reusing an already consumed refresh token revokes its entire token family.

### Revocation

```http
POST /oauth/revoke
Content-Type: application/x-www-form-urlencoded

 token=ACCESS_OR_REFRESH_TOKEN&client_id=CLIENT_ID
```

Revocation is idempotent. Users can also revoke a connected application from **Settings → Connected apps**, immediately invalidating its active access and refresh credentials.

## Create Memories

```http
POST /api/v1/memories
Authorization: Bearer ACCESS_TOKEN
Idempotency-Key: UNIQUE_RETRY_KEY
Content-Type: application/json
```

Request bodies contain 1–100 items and are atomic: either every item is added to one validated immutable successor snapshot, or none are.

```json
{
  "items": [
    {
      "kind": "basic",
      "challenge": "What is the additive identity?",
      "answer": "0",
      "hint": "For real numbers",
      "responseMode": "self-check"
    },
    {
      "kind": "cloze",
      "text": "The additive identity is {{0}}.",
      "responseMode": "self-check"
    }
  ]
}
```

Each basic item creates one Prompt. Each `{{target}}` in a cloze item creates its own independently scheduled Prompt. Lineage generates all durable Prompt, cloze-target, provenance, audit, and request identities.

A successful response is HTTP 201:

```json
{
  "requestId": "stable request identity",
  "corpusId": "active workspace identity",
  "priorSnapshotDigest": "sha256 digest",
  "newSnapshotDigest": "sha256 digest",
  "created": [
    { "itemIndex": 0, "kind": "basic", "promptIds": ["generated id"] },
    { "itemIndex": 1, "kind": "cloze", "promptIds": ["generated id"] }
  ]
}
```

The same client, user, idempotency key, and byte-equivalent semantic body replay the stored response. Reusing a key with a different body is rejected.

## Semantics and limits

- Writes always target the connected user’s active workspace at execution time.
- An account without an active workspace receives a validation error; the API never silently creates one.
- Basic and cloze inputs use the same atomic/disclosure-safe semantics as native Lineage authoring.
- The complete candidate corpus is authoritatively validated and canonicalized by `@lineage/core`.
- Concurrent native or integration changes use optimistic compare-and-append with bounded fresh-base retries; unresolved contention returns HTTP 409.
- Request bodies are limited to 1 MiB.
- Access tokens are limited to 60 requests per one-minute persisted window.
- Credential and API responses use `Cache-Control: no-store`.

## Errors

Errors use a stable JSON shape:

```json
{
  "error": "invalid_request",
  "error_description": "Human-readable description"
}
```

Expected statuses include:

- `400` malformed requests or idempotency mismatch;
- `401` missing, invalid, expired, or revoked bearer credentials;
- `403` insufficient scope;
- `409` unresolved concurrent workspace mutation;
- `413` oversized body;
- `415` unsupported media type;
- `422` structurally valid input rejected by Lineage semantics;
- `429` rate limit exceeded.

Clients must not infer credential validity from revocation responses. Tokens, authorization codes, client secrets, and verifier values must never be placed in logs or URLs beyond the short-lived authorization-code redirect defined by the protocol.
