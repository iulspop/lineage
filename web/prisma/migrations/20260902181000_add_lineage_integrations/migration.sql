-- CreateTable
CREATE TABLE "IntegrationClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "clientSecretHash" TEXT,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "disabledAt" DATETIME,
    CONSTRAINT "IntegrationClient_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationRedirectUri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationRedirectUri_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "IntegrationGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationGrant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationAuthorizationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeHash" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "codeChallenge" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationAuthorizationCode_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationAuthorizationCode_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationAccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "lastUsedAt" DATETIME,
    "windowStartedAt" DATETIME,
    "windowRequestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationAccessToken_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationRefreshTokenFamily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationRefreshTokenFamily_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationRefreshTokenFamily_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationRefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "replacedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationRefreshToken_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "IntegrationRefreshTokenFamily" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationIdempotencyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "IntegrationIdempotencyRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationIdempotencyRecord_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationIdempotencyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationCreationAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "corpusId" TEXT,
    "priorDigest" TEXT,
    "newDigest" TEXT,
    "itemCount" INTEGER NOT NULL,
    "createdPromptCount" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationCreationAudit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "IntegrationClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationCreationAudit_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "IntegrationGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationCreationAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationClient_clientId_key" ON "IntegrationClient"("clientId");
CREATE INDEX "IntegrationClient_createdByUserId_idx" ON "IntegrationClient"("createdByUserId");
CREATE UNIQUE INDEX "IntegrationRedirectUri_clientId_uri_key" ON "IntegrationRedirectUri"("clientId", "uri");
CREATE INDEX "IntegrationRedirectUri_clientId_idx" ON "IntegrationRedirectUri"("clientId");
CREATE UNIQUE INDEX "IntegrationGrant_userId_clientId_scope_key" ON "IntegrationGrant"("userId", "clientId", "scope");
CREATE INDEX "IntegrationGrant_clientId_revokedAt_idx" ON "IntegrationGrant"("clientId", "revokedAt");
CREATE INDEX "IntegrationGrant_userId_revokedAt_idx" ON "IntegrationGrant"("userId", "revokedAt");
CREATE UNIQUE INDEX "IntegrationAuthorizationCode_codeHash_key" ON "IntegrationAuthorizationCode"("codeHash");
CREATE INDEX "IntegrationAuthorizationCode_clientId_expiresAt_idx" ON "IntegrationAuthorizationCode"("clientId", "expiresAt");
CREATE INDEX "IntegrationAuthorizationCode_grantId_expiresAt_idx" ON "IntegrationAuthorizationCode"("grantId", "expiresAt");
CREATE UNIQUE INDEX "IntegrationAccessToken_tokenHash_key" ON "IntegrationAccessToken"("tokenHash");
CREATE INDEX "IntegrationAccessToken_clientId_expiresAt_idx" ON "IntegrationAccessToken"("clientId", "expiresAt");
CREATE INDEX "IntegrationAccessToken_grantId_revokedAt_expiresAt_idx" ON "IntegrationAccessToken"("grantId", "revokedAt", "expiresAt");
CREATE INDEX "IntegrationRefreshTokenFamily_clientId_revokedAt_idx" ON "IntegrationRefreshTokenFamily"("clientId", "revokedAt");
CREATE INDEX "IntegrationRefreshTokenFamily_grantId_revokedAt_idx" ON "IntegrationRefreshTokenFamily"("grantId", "revokedAt");
CREATE UNIQUE INDEX "IntegrationRefreshToken_tokenHash_key" ON "IntegrationRefreshToken"("tokenHash");
CREATE INDEX "IntegrationRefreshToken_familyId_expiresAt_idx" ON "IntegrationRefreshToken"("familyId", "expiresAt");
CREATE UNIQUE INDEX "IntegrationIdempotencyRecord_clientId_userId_key_key" ON "IntegrationIdempotencyRecord"("clientId", "userId", "key");
CREATE INDEX "IntegrationIdempotencyRecord_grantId_createdAt_idx" ON "IntegrationIdempotencyRecord"("grantId", "createdAt");
CREATE INDEX "IntegrationIdempotencyRecord_expiresAt_idx" ON "IntegrationIdempotencyRecord"("expiresAt");
CREATE UNIQUE INDEX "IntegrationCreationAudit_requestId_key" ON "IntegrationCreationAudit"("requestId");
CREATE INDEX "IntegrationCreationAudit_clientId_createdAt_idx" ON "IntegrationCreationAudit"("clientId", "createdAt");
CREATE INDEX "IntegrationCreationAudit_grantId_createdAt_idx" ON "IntegrationCreationAudit"("grantId", "createdAt");
CREATE INDEX "IntegrationCreationAudit_userId_createdAt_idx" ON "IntegrationCreationAudit"("userId", "createdAt");
