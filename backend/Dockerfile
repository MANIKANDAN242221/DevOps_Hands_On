# Stage 1: Build
FROM node:lts AS build
WORKDIR /tmp
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test

# Stage 2: Runtime
FROM node:lts-bullseye-slim AS artifact
ENV TZ=Asia/Kolkata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# Verify
RUN node --version

WORKDIR /srv
COPY --from=build /tmp/node_modules ./node_modules
COPY --from=build /tmp/src ./src
COPY --from=build /tmp/package*.json ./

EXPOSE 4000

CMD ["npm", "start"]