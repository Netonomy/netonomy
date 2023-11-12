FROM node:20-alpine
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package.json ./

RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
