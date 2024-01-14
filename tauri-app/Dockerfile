FROM oven/bun:1

# bind your app to the gateway IP
ENV HOST=0.0.0.0

WORKDIR /app

COPY package*.json ./

RUN bun install 

COPY . .

EXPOSE 1420 

CMD ["bun", "run", "dev"]