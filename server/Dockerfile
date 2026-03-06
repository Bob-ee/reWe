FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
EXPOSE 5000
RUN mkdir -p /app/data
CMD ["node", "index.js"]