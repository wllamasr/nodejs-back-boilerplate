FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Default command, can be overridden
CMD ["bun", "run", "src/index.ts"]
