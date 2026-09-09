FROM node:24-trixie

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/database

EXPOSE 5000

CMD ["node", "src/server.js"]
