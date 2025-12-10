FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

# Default command, can be overridden
CMD ["bun", "run", "src/index.ts"]
