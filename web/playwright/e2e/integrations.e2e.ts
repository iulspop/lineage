import { createHash, randomBytes, randomUUID } from "node:crypto"
import { expect, test } from "@playwright/test"

import {
  loginAsTestUser,
  setupIntegrationClient,
  setupLineageCorpus,
} from "../auth-utils"

const base64Url = (value: Buffer) =>
  value
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "")

test("connects an app and creates atomic Memories", async ({
  page,
  request,
}) => {
  const user = await loginAsTestUser(page)
  await setupLineageCorpus(user.id, `integration-${randomUUID()}`)
  const client = await setupIntegrationClient(user.id)
  const verifier = base64Url(randomBytes(32))
  const challenge = base64Url(createHash("sha256").update(verifier).digest())
  const state = randomUUID()
  const authorize = new URL("http://localhost:5251/oauth/authorize")
  authorize.search = new URLSearchParams({
    client_id: client.clientId,
    code_challenge: challenge,
    code_challenge_method: "S256",
    redirect_uri: client.redirectUri,
    response_type: "code",
    scope: "memories:write",
    state,
  }).toString()

  await page.goto(authorize.toString())
  await expect(
    page.getByRole("heading", { name: "Connect Test integration?" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Allow direct creation" }).click()
  await page.waitForURL(`${client.redirectUri}**`)
  const callback = new URL(page.url())
  expect(callback.searchParams.get("state")).toBe(state)
  const code = callback.searchParams.get("code")
  expect(code).toBeTruthy()
  if (!code) throw new Error("Authorization response did not include a code")

  const tokenResponse = await request.post("/oauth/token", {
    form: {
      client_id: client.clientId,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: client.redirectUri,
    },
  })
  expect(tokenResponse.status()).toBe(200)
  const tokens = (await tokenResponse.json()) as { access_token: string }

  const createResponse = await request.post("/api/v1/memories", {
    data: {
      items: [
        { answer: "4", challenge: "What is 2 + 2?", kind: "basic" },
        { kind: "cloze", text: "The successor of 4 is {{5}}." },
      ],
    },
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Idempotency-Key": randomUUID(),
    },
  })
  expect(createResponse.status()).toBe(201)
  const created = (await createResponse.json()) as { created: unknown[] }
  expect(created.created).toHaveLength(2)

  await page.goto("/library")
  await expect(page.getByText("What is 2 + 2?")).toBeVisible()
  await expect(page.getByText("The successor of 4 is")).toBeVisible()
})
