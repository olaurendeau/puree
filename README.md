# puree.chat

A [Next.js](https://nextjs.org) app backed by Postgres. Everything (dev server,
database, lint, type-check, tests) runs in Docker: no Node.js or Postgres is
needed on the host.

## Run the app

```bash
docker compose up
```

This starts the Next.js dev server and Postgres. Open
[http://localhost:3000](http://localhost:3000). If port 3000 is taken, pick
another one with `APP_PORT=3001 docker compose up`.

The first start installs the dependencies into a Docker volume (a few minutes).
They are installed again automatically whenever `package-lock.json` changes.

Stop with `docker compose down --remove-orphans`.

## Check the project

```bash
docker compose run --rm app sh -c 'npm run lint && npx tsc --noEmit && npm test'
docker compose down --remove-orphans
```

This does not start Postgres. CI runs this same command on every pull request
(with `APP_USER=root`, because the runner's workspace is not owned by uid 1000).
Any other npm command works the same way:
`docker compose run --rm app npm <command>`.

## Environment variables

Next.js reads `.env.local` from the repository root. Copy `.env.example` to
`.env.local` and fill in the values:

| Variable                | Used for                                                      |
| ----------------------- | ------------------------------------------------------------- |
| `CLAUDE_API_KEY`        | Anthropic API key for the chat                                |
| `DATABASE_URL`          | Postgres connection (set by `compose.yaml` inside Docker)     |
| `NEXT_PUBLIC_GA_ID`     | Google Analytics id                                           |
| `VERCEL_GIT_COMMIT_SHA` | Commit shown in the footer (set by Vercel)                    |

## Database

Postgres runs in the `db` service with no port published on the host. Open a
shell on it with:

```bash
docker compose exec db psql -U puree
```

The SQL files in `src/db/migrations` run once, when the database volume is
created. After adding or changing a migration, recreate the database (this
deletes its data):

```bash
docker compose down -v
docker compose up
```

## After changing `docker/Dockerfile`

```bash
docker compose build
```
