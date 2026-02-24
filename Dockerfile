FROM node:22-alpine AS build

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
