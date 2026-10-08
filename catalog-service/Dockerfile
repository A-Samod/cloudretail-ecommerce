FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

EXPOSE 3002

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
