-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "image" TEXT DEFAULT 'https://api.realworld.io/images/smiley-cyrus.jpeg',
    "bio" TEXT,
    "demo" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("bio", "demo", "email", "id", "image", "password", "username") SELECT "bio", "demo", "email", "id", "image", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
