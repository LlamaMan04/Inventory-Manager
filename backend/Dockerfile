FROM node:22-alpine

WORKDIR /app

# Install dependencies from the lockfile for reproducible builds.
COPY package*.json ./
RUN npm ci

# Prisma needs the schema, migration history, and Prisma config available
# both when generating the client and when running migrations.
COPY prisma ./prisma
COPY prisma7.config.js ./

# Prisma 7 loads DATABASE_URL from prisma7.config.js during generation.
# A build-time placeholder is sufficient; the real value is supplied at runtime.
RUN DATABASE_URL=mysql://build:build@localhost:3306/build npx prisma generate

COPY src ./src

ENV NODE_ENV=production
ENV SERVER_PORT=5001

EXPOSE 5001

CMD ["npm", "start"]
