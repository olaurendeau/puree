CREATE TABLE IF NOT EXISTS "starred_conversations" (
    "id" SERIAL PRIMARY KEY,
    "is_starred" BOOLEAN NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "upvotes" INT NOT NULL,
    "user_message" TEXT NOT NULL,
    "assistant_message" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_starred_conversations_upvotes" ON "starred_conversations" ("is_starred", "language", "upvotes");

CREATE UNIQUE INDEX "idx_starred_conversations_unique" ON "starred_conversations" ("language", "user_message", "assistant_message");