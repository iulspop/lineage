import { prisma } from "~/utils/db.server"

export async function loader() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1")
    return new Response("OK")
  } catch (error) {
    console.error("Healthcheck failed:", error)
    return new Response("ERROR", { status: 500 })
  }
}
