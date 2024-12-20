FROM node:20-alpine
ENV NODE_ENV development
ENV PORT 3000
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
CMD [ "node", "index.js" ]