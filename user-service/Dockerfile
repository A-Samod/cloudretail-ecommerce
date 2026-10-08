FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 3001

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
