FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/booking
WORKDIR /usr/src/booking

# Install app dependencies
COPY package.json /usr/src/booking/
RUN npm install

# Install bower packages
RUN npm install -g bower
COPY bower.json /usr/src/booking/bower.json
COPY .bowerrc /usr/src/booking/.bowerrc
RUN bower install --quiet --allow-root --config.interactive=false

# Bundle app source
COPY . /usr/src/booking

EXPOSE 8080
CMD [ "npm", "start" ]
