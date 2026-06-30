FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm test -- --passWithNoTests

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app .

EXPOSE 4000

CMD ["npm","start"]