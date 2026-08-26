import { createPopulatedUser } from "../app/features/users/infrastructure/users-factories.server"
import { saveUserToDatabase } from "../app/features/users/infrastructure/users-model.server"
import { prisma } from "../app/utils/db.server"

async function seed() {
  console.log("🌱 Seeding...")
  console.time("🌱 Database has been seeded")

  await prisma.user.deleteMany()

  const demoUsers = [
    createPopulatedUser({ email: "alice@example.com" }),
    createPopulatedUser({ email: "bob@example.com" }),
    createPopulatedUser({ email: "charlie@example.com" }),
  ]

  console.time(`👥 Created ${demoUsers.length} users`)

  for (const user of demoUsers) {
    await saveUserToDatabase(user)
    console.log(`  ✓ ${user.email}`)
  }

  console.timeEnd(`👥 Created ${demoUsers.length} users`)
  console.timeEnd("🌱 Database has been seeded")

  console.log("\n📝 Demo accounts:")
  console.log("  • alice@example.com")
  console.log("  • bob@example.com")
  console.log("  • charlie@example.com")
}

seed()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
