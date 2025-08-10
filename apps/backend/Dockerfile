FROM node:20-bookworm-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Copy manifest and Prisma schema first so postinstall can find it
COPY package.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
# Copy application source
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --schema prisma/schema.postgres.prisma && node server.js"]
