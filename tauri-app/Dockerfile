# Use an official Node runtime as the base image, node 20
FROM node:20

# bind your app to the gateway IP
ENV HOST=0.0.0.0

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json first to leverage Docker cache
COPY package*.json ./

# Run npm install inside the container with a clean slate flag
RUN npm install 

# COPY entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]

# Copy the current directory contents into the container at /app
# Exclude node_modules explicitly, although npm ci should handle that
COPY . .

# Make port 4000 available to the world outside this container
EXPOSE 1420 

# Run your application when the container launches
CMD ["npm", "run", "dev"]