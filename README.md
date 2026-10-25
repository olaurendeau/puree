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
| `CRON_SECRET`           | Secret of the chat health cron route (see [Monitoring](#monitoring)) |
| `UPDOWN_PULSE_URL`      | updown.io pulse URL the health cron pings (see [Monitoring](#monitoring)) |

## Monitoring

A daily health check tells us when the chat stops answering. A Vercel Cron
([`vercel.json`](vercel.json)) calls `GET /api/cron/chat-health` every day at
07:00 UTC. The route sends one real chat request through `generateAIResponse`
and, only if the model returns a non-empty answer, pings an updown.io **pulse**
URL. If updown receives no pulse within its period, it alerts.

The route answers `200 {"ok":true}` when the chat answered and the pulse was
sent, `503` when the chat did not answer (nothing is pinged), `500` when the
chat answered but the pulse could not be sent (`UPDOWN_PULSE_URL` unset or
updown unreachable), and `401` without the right secret. The response bodies
carry no detail; the cause is in the Vercel runtime logs.

### Vercel environment variables

Set both on the Vercel project, for the **Production** environment (cron jobs
only call the production deployment), then redeploy:

| Variable           | Value                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `CRON_SECRET`      | At least 16 random characters. Vercel sends it as `Authorization: Bearer <CRON_SECRET>`. Without it the route always answers 401. |
| `UPDOWN_PULSE_URL` | The private pulse URL updown shows when the check is created. Keep it secret.               |

### updown.io pulse check

Create the check by hand on updown.io:

- **Type**: Pulse
- **Alias**: for example `puree.chat chat health`
- **Period** (the "time interval before notification"): **26 hours**. updown has
  no separate grace field: the margin is part of the period. Do not use 1 day.
  On the Hobby plan Vercel runs the cron at any time within the 07:00 hour, so
  two pulses can be up to 24 h 59 min apart, and a 1 day period would raise
  false alerts.
- **Alerts**: add the contacts to notify.

Vercel does not retry a failed cron run, so a single failed day (no pulse)
alerts after at most 26 hours.

Sources: [Vercel cron jobs](https://vercel.com/docs/cron-jobs),
[managing them](https://vercel.com/docs/cron-jobs/manage-cron-jobs) and
[Hobby limits](https://vercel.com/docs/cron-jobs/usage-and-pricing);
[updown pulse monitoring](https://updown.io/doc/how-pulse-cron-monitoring-works).

### Trigger it by hand

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" https://puree.chat/api/cron/chat-health
```

This runs a real chat request and, on success, sends a pulse. A `200` means
the chat answers and updown received the pulse.

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
