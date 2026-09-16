FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --no-audit --no-fund && npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]

