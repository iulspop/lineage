-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IntegrationAccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT '',
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "lastUsedAt" DATETIME,
    "windowStartedAt" DATETIME,
    "windowRequestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationAccessToken_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IntegrationAccessToken" ("clientId", "createdAt", "expiresAt", "grantId", "id", "lastUsedAt", "revokedAt", "scope", "tokenHash", "windowRequestCount", "windowStartedAt") SELECT "clientId", "createdAt", "expiresAt", "grantId", "id", "lastUsedAt", "revokedAt", "scope", "tokenHash", "windowRequestCount", "windowStartedAt" FROM "IntegrationAccessToken";
DROP TABLE "IntegrationAccessToken";
ALTER TABLE "new_IntegrationAccessToken" RENAME TO "IntegrationAccessToken";
CREATE UNIQUE INDEX "IntegrationAccessToken_tokenHash_key" ON "IntegrationAccessToken"("tokenHash");
CREATE INDEX "IntegrationAccessToken_clientId_expiresAt_idx" ON "IntegrationAccessToken"("clientId", "expiresAt");
CREATE INDEX "IntegrationAccessToken_grantId_revokedAt_expiresAt_idx" ON "IntegrationAccessToken"("grantId", "revokedAt", "expiresAt");
CREATE TABLE "new_IntegrationAuthorizationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeHash" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT '',
    "codeChallenge" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationAuthorizationCode_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationAuthorizationCode_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IntegrationAuthorizationCode" ("clientId", "codeChallenge", "codeHash", "createdAt", "expiresAt", "grantId", "id", "redirectUri", "scope", "usedAt") SELECT "clientId", "codeChallenge", "codeHash", "createdAt", "expiresAt", "grantId", "id", "redirectUri", "scope", "usedAt" FROM "IntegrationAuthorizationCode";
DROP TABLE "IntegrationAuthorizationCode";
ALTER TABLE "new_IntegrationAuthorizationCode" RENAME TO "IntegrationAuthorizationCode";
CREATE UNIQUE INDEX "IntegrationAuthorizationCode_codeHash_key" ON "IntegrationAuthorizationCode"("codeHash");
CREATE INDEX "IntegrationAuthorizationCode_clientId_expiresAt_idx" ON "IntegrationAuthorizationCode"("clientId", "expiresAt");
CREATE INDEX "IntegrationAuthorizationCode_grantId_expiresAt_idx" ON "IntegrationAuthorizationCode"("grantId", "expiresAt");
CREATE TABLE "new_IntegrationClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "clientSecretHash" TEXT,
    "registrationType" TEXT NOT NULL DEFAULT 'manual',
    "clientUri" TEXT,
    "softwareId" TEXT,
    "softwareVersion" TEXT,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "disabledAt" DATETIME,
    CONSTRAINT "IntegrationClient_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_IntegrationClient" ("clientId", "clientSecretHash", "clientType", "createdAt", "createdByUserId", "disabledAt", "id", "name", "updatedAt") SELECT "clientId", "clientSecretHash", "clientType", "createdAt", "createdByUserId", "disabledAt", "id", "name", "updatedAt" FROM "IntegrationClient";
DROP TABLE "IntegrationClient";
ALTER TABLE "new_IntegrationClient" RENAME TO "IntegrationClient";
CREATE UNIQUE INDEX "IntegrationClient_clientId_key" ON "IntegrationClient"("clientId");
CREATE INDEX "IntegrationClient_createdByUserId_idx" ON "IntegrationClient"("createdByUserId");
CREATE INDEX "IntegrationClient_registrationType_createdAt_disabledAt_idx" ON "IntegrationClient"("registrationType", "createdAt", "disabledAt");
CREATE TABLE "new_IntegrationGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "IntegrationGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationGrant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IntegrationGrant" ("clientId", "createdAt", "id", "lastUsedAt", "revokedAt", "scope", "updatedAt", "userId") SELECT "clientId", "createdAt", "id", "lastUsedAt", "revokedAt", "scope", "updatedAt", "userId" FROM "IntegrationGrant";
DROP TABLE "IntegrationGrant";
ALTER TABLE "new_IntegrationGrant" RENAME TO "IntegrationGrant";
CREATE INDEX "IntegrationGrant_clientId_revokedAt_idx" ON "IntegrationGrant"("clientId", "revokedAt");
CREATE INDEX "IntegrationGrant_userId_revokedAt_idx" ON "IntegrationGrant"("userId", "revokedAt");
CREATE UNIQUE INDEX "IntegrationGrant_userId_clientId_scope_resource_key" ON "IntegrationGrant"("userId", "clientId", "scope", "resource");
CREATE TABLE "new_IntegrationRefreshTokenFamily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT '',
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationRefreshTokenFamily_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationRefreshTokenFamily_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IntegrationRefreshTokenFamily" ("clientId", "createdAt", "grantId", "id", "revokedAt") SELECT "clientId", "createdAt", "grantId", "id", "revokedAt" FROM "IntegrationRefreshTokenFamily";
DROP TABLE "IntegrationRefreshTokenFamily";
ALTER TABLE "new_IntegrationRefreshTokenFamily" RENAME TO "IntegrationRefreshTokenFamily";
CREATE INDEX "IntegrationRefreshTokenFamily_clientId_revokedAt_idx" ON "IntegrationRefreshTokenFamily"("clientId", "revokedAt");
CREATE INDEX "IntegrationRefreshTokenFamily_grantId_revokedAt_idx" ON "IntegrationRefreshTokenFamily"("grantId", "revokedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
