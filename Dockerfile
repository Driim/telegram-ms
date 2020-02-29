FROM node:10

# set a directory for the app
WORKDIR /home/node/app

# npm package config
COPY package*.json ./
COPY .env .

# install dependency
RUN npm install

# Copy sources
COPY . .

# Run application
CMD [ "npm", "start" ]