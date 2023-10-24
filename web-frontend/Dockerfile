# Use an official Node runtime as the base image, node 20
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Run npm install inside the container with a clean slate flag
RUN npm ci --force

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Copy the current directory contents into the container at /app
# Exclude node_modules explicitly, although npm ci should handle that
COPY . .


# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run your application when the container launches
CMD ["npm", "run", "dev"]
