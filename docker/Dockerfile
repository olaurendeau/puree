FROM node:24-bookworm-slim

# The repo and the host node_modules are never copied into the image: the repo
# is bind-mounted at /app and node_modules lives in a named volume. Creating
# the directory here makes the volume inherit the `node` (uid 1000) owner.
RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app
USER node
