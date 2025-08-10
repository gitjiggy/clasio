FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ../..
COPY . .
RUN npm install --omit=dev || true
EXPOSE 3000
CMD ["npm", "run", "dev"]
