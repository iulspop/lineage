import { createHash, randomBytes, randomUUID } from "node:crypto"
import { expect, test } from "@playwright/test"

import { loginAsTestUser, setupLineageCorpus } from "../auth-utils"

const base64Url = (value: Buffer) =>
  value
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "")

const resource = "http://localhost:5251/mcp"

function mcpHeaders(accessToken: string) {
  return {
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "MCP-Protocol-Version": "2025-11-25",
  }
}

async function mcpJson(response: { text(): Promise<string> }) {
  const body = await response.text()
  const data = body
    .split("\n")
    .find((line) => line.startsWith("data: "))
    ?.slice("data: ".length)
  return JSON.parse(data ?? body) as Record<string, unknown>
}

test("connects an MCP host and creates only atomic Memories", async ({
  page,
  request,
}) => {
  const user = await loginAsTestUser(page)
  await setupLineageCorpus(user.id, `mcp-${randomUUID()}`)
  const redirectUri = "http://localhost:5251/integration-callback"

  const registrationResponse = await request.post("/oauth/register", {
    data: {
      application_type: "web",
      client_name: "Test MCP host",
      grant_types: ["authorization_code"],
      redirect_uris: [redirectUri],
      response_types: ["code"],
      scope: "memories:write",
      token_endpoint_auth_method: "none",
    },
  })
  expect(registrationResponse.status()).toBe(201)
  const registration = (await registrationResponse.json()) as {
    client_id: string
  }

  const verifier = base64Url(randomBytes(32))
  const challenge = base64Url(createHash("sha256").update(verifier).digest())
  const state = randomUUID()
  const authorize = new URL("http://localhost:5251/oauth/authorize")
  authorize.search = new URLSearchParams({
    client_id: registration.client_id,
    code_challenge: challenge,
    code_challenge_method: "S256",
    redirect_uri: redirectUri,
    resource,
    response_type: "code",
    scope: "memories:write",
    state,
  }).toString()

  await page.goto(authorize.toString())
  await expect(
    page.getByRole("heading", { name: "Connect Test MCP host?" }),
  ).toBeVisible()
  await Promise.all([
    page.waitForURL(`${redirectUri}**`, { waitUntil: "commit" }),
    page.getByRole("button", { name: "Allow direct creation" }).click(),
  ])
  const callback = new URL(page.url())
  expect(callback.searchParams.get("state")).toBe(state)
  const code = callback.searchParams.get("code")
  expect(code).toBeTruthy()
  if (!code) throw new Error("Authorization response did not include a code")

  const tokenResponse = await request.post("/oauth/token", {
    form: {
      client_id: registration.client_id,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      resource,
    },
  })
  expect(tokenResponse.status()).toBe(200)
  const tokens = (await tokenResponse.json()) as { access_token: string }

  const initializeResponse = await request.post("/mcp", {
    data: {
      id: "initialize",
      jsonrpc: "2.0",
      method: "initialize",
      params: {
        capabilities: {},
        clientInfo: { name: "Playwright MCP host", version: "1.0.0" },
        protocolVersion: "2025-11-25",
      },
    },
    headers: mcpHeaders(tokens.access_token),
  })
  expect(initializeResponse.status()).toBe(200)

  const listResponse = await request.post("/mcp", {
    data: { id: "list", jsonrpc: "2.0", method: "tools/list", params: {} },
    headers: mcpHeaders(tokens.access_token),
  })
  expect(listResponse.status()).toBe(200)
  const listed = (await mcpJson(listResponse)) as {
    result: { tools: Array<{ name: string }> }
  }
  expect(listed.result.tools.map(({ name }) => name)).toEqual([
    "create_memories",
  ])

  const call = {
    id: "create-atomic-memories",
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      arguments: {
        items: [
          { answer: "4", challenge: "What is 2 + 2?", kind: "basic" },
          { kind: "cloze", text: "{{5}} is the successor of {{4}}." },
        ],
      },
      name: "create_memories",
    },
  }
  const createResponse = await request.post("/mcp", {
    data: call,
    headers: mcpHeaders(tokens.access_token),
  })
  expect(createResponse.status()).toBe(200)
  const created = (await mcpJson(createResponse)) as {
    result: { structuredContent: Record<string, unknown> }
  }
  expect(created.result.structuredContent).toEqual({
    createdMemoryCount: 3,
    itemCount: 2,
    status: "created",
  })

  const retryResponse = await request.post("/mcp", {
    data: call,
    headers: mcpHeaders(tokens.access_token),
  })
  expect(await retryResponse.text()).toBe(await createResponse.text())

  await page.goto("/library")
  await expect(page.getByText("What is 2 + 2?")).toBeVisible()
  await expect(page.getByText("is the successor of").first()).toBeVisible()

  await page.goto("/settings/integrations")
  await expect(page.getByText("Test MCP host")).toBeVisible()
  await expect(page.getByText("MCP connection")).toBeVisible()
  await page.getByRole("button", { name: "Revoke" }).click()
  await expect(page.getByText("Test MCP host")).not.toBeVisible()

  const revokedResponse = await request.post("/mcp", {
    data: { id: "revoked", jsonrpc: "2.0", method: "tools/list", params: {} },
    headers: mcpHeaders(tokens.access_token),
  })
  expect(revokedResponse.status()).toBe(401)
})
