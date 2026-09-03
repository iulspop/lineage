# Lineage Remote MCP Server

Lineage exposes a remote Model Context Protocol server that lets an AI agent create Memories after the user explicitly connects their Lineage account.

The production endpoint is:

```text
https://lineage-polyanova.fly.dev/mcp
```

The server uses stateless Streamable HTTP and the official Model Context Protocol TypeScript server SDK. It exposes exactly one tool and no resources or prompts.

## Privacy boundary

The MCP connection is write-only. It cannot read or return:

- corpus contents or existing Memories;
- answers;
- review history or scheduling state;
- Sources, Materials, or assets;
- snapshot digests;
- routine durable identifiers.

Successful tool calls return only a success status, submitted item count, and created Memory count.

## Discovery and authorization

MCP clients can discover authorization requirements from:

```text
GET /.well-known/oauth-protected-resource/mcp
GET /.well-known/oauth-authorization-server
```

Unauthenticated requests to `/mcp` return a Bearer challenge containing the protected-resource metadata URL.

Lineage uses an authorization-code flow with:

- explicit user consent;
- mandatory state and PKCE S256;
- exact registered redirect URI matching;
- sole scope `memories:write`;
- OAuth resource audience bound to the canonical `/mcp` URL;
- short-lived opaque access tokens;
- rotating refresh-token families;
- immediate revocation from **Settings → Connected apps**.

A token issued without the exact MCP resource audience is rejected by `/mcp`.

### Dynamic client registration

Compatible MCP hosts can discover and call the advertised registration endpoint:

```http
POST /oauth/register
Content-Type: application/json
```

Example metadata:

```json
{
  "application_type": "web",
  "client_name": "Example MCP Host",
  "grant_types": ["authorization_code"],
  "redirect_uris": ["https://client.example/callback"],
  "response_types": ["code"],
  "scope": "memories:write",
  "token_endpoint_auth_method": "none"
}
```

Dynamic registrations are public clients: Lineage does not issue a client secret. Redirects must use HTTPS, except loopback HTTP callbacks used by local applications. Registration metadata and request size are bounded, and registration is throttled.

The authorization request and token exchange must include the MCP resource:

```text
resource=https://lineage-polyanova.fly.dev/mcp
```

## MCP protocol

Send JSON-RPC requests to `POST /mcp`:

```http
POST /mcp
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
Accept: application/json, text/event-stream
```

Clients should initialize the MCP connection, then call `tools/list`. Lineage advertises only `create_memories`.

The endpoint is stateless. MCP request IDs participate in server-side idempotency, so retrying the same tool request with the same arguments does not duplicate Memories. `GET` and `DELETE` session operations are not supported.

## `create_memories`

The tool accepts 1–100 basic or cloze items in one atomic request.

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
      "text": "A right triangle satisfies {{a^2 + b^2 = c^2}}.",
      "responseMode": "self-check"
    }
  ]
}
```

### Atomicity rules

- Each basic item must contain exactly one retrieval target: one challenge and one answer.
- Split multi-fact questions into separate basic items.
- Each `{{target}}` in a cloze item creates an independently scheduled Memory.
- Multiple cloze targets are appropriate only when every deletion is independently meaningful.
- Lineage generates all durable identities; clients cannot supply them.

Writes target the connected user’s active workspace at execution time. Lineage validates and canonicalizes the complete successor corpus through `@lineage/core`, records integration provenance, and compare-and-appends an immutable snapshot. If no active workspace exists, the tool fails rather than silently creating one.

A successful structured result has this shape:

```json
{
  "status": "created",
  "itemCount": 2,
  "createdMemoryCount": 2
}
```

A cloze item with multiple targets can produce a `createdMemoryCount` greater than `itemCount`.

## Errors and limits

Expected transport failures include:

- `400` malformed JSON or protocol request;
- `401` missing, invalid, expired, revoked, or wrong-resource bearer token;
- `403` foreign `Origin` or insufficient authorization;
- `405` unsupported HTTP method;
- `413` request body larger than 1 MiB;
- `415` non-JSON media type;
- `429` rate limit exceeded.

Tool failures use bounded messages and stable codes:

- `validation_failed`;
- `workspace_unavailable`;
- `write_conflict`;
- `request_in_progress`.

The endpoint allows at most 60 authenticated requests per access token in a persisted one-minute window. Credential and MCP responses use no-store security headers. Bearer tokens, authorization codes, refresh tokens, PKCE verifiers, and submitted Memory content must not be logged.

## Disconnecting

Open **Settings → Connected apps** in Lineage and revoke the MCP host. Revocation immediately invalidates the grant’s active access tokens and refresh-token families. The host must repeat explicit authorization before it can create more Memories.

## Compatibility

MCP hosts vary in their support for protected-resource discovery, dynamic client registration, OAuth resource indicators, and Streamable HTTP. A compatible host must support the discovery and OAuth behavior documented above. Hosts that require a preconfigured client can use an owner-approved manually registered client while retaining the same scope and MCP resource audience.

For the underlying non-MCP REST authorization and Memory-creation contract, see `docs/integration-api.md`.
