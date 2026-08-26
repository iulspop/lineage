import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, test, vi } from "vitest"

let directory: string | undefined

afterEach(async () => {
  vi.unstubAllEnvs()
  vi.resetModules()
  if (directory) await rm(directory, { force: true, recursive: true })
  directory = undefined
})

async function loadAttachments() {
  directory = await mkdtemp(join(tmpdir(), "chat-attachments-"))
  vi.stubEnv("CHAT_ATTACHMENT_DIRECTORY", directory)
  return import("./attachments.server")
}

describe("saveChatAttachment()", () => {
  test("given: a valid PNG, should: store it under an opaque name", async () => {
    const { saveChatAttachment } = await loadAttachments()
    const bytes = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3,
    ])

    const actual = await saveChatAttachment(
      new File([bytes], "screen shot.png", { type: "image/png" }),
    )

    expect(actual.originalName).toEqual("screen shot.png")
    expect(actual.storageName).not.toContain("screen shot")
    expect(await readFile(actual.path)).toEqual(Buffer.from(bytes))
  })

  test("given: mismatched content, should: reject and clean up the file", async () => {
    const { saveChatAttachment } = await loadAttachments()

    await expect(
      saveChatAttachment(
        new File(["not an image"], "fake.png", { type: "image/png" }),
      ),
    ).rejects.toThrow("INVALID_ATTACHMENT_CONTENT")

    const { readdir } = await import("node:fs/promises")
    expect(await readdir(directory as string)).toEqual([])
  })

  test("given: an unsupported type, should: reject it", async () => {
    const { saveChatAttachment } = await loadAttachments()

    await expect(
      saveChatAttachment(
        new File(["hello"], "notes.txt", { type: "text/plain" }),
      ),
    ).rejects.toThrow("INVALID_ATTACHMENT_TYPE")
  })
})

describe("openChatAttachment()", () => {
  test("given: a traversal storage name, should: refuse to open it", async () => {
    const { openChatAttachment } = await loadAttachments()

    expect(openChatAttachment("../secret.pdf")).toEqual(null)
  })
})
