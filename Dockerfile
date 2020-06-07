FROM node:latest

WORKDIR /var/easywiki

# Copy environment files
COPY package.json .
COPY yarn.lock .
COPY ecosystem.config.js .
COPY tsconfig.json .

# Install EasyWiki
RUN npm install pm2 typescript -g
RUN yarn install

# Copy source
COPY ./src ./src
COPY ./javascript ./javascript
COPY ./minifier ./minifier

# Copy all partials
COPY ./partials/body.html ./partials/body.html
COPY ./partials/head.html ./partials/head.html
COPY ./partials/header.html ./partials/header.html
COPY ./partials/imageViewer.html ./partials/imageViewer.html

# Copy views
COPY ./views ./views

# Copy all javascript
COPY ./public/js ./public/js

# Copy theme files
COPY ./themes ./themes
COPY ./public/css ./public/css

ADD https://github.com/EasyWiki/EasyWiki-Themes/releases/download/V1.1/themes.zip .
RUN unzip -o themes.zip

# Build source
RUN yarn build
RUN yarn minify

# Copy configuration files
COPY ./config ./config

# Remove build files/folders
RUN rm -Rf ./src
RUN rm -Rf ./javascript
RUN rm -Rf ./minifier
RUN rm ./tsconfig.json
RUN rm ./themes.zip

# Permissions
RUN chmod 740 /var/easywiki

RUN chmod 640 ./config/*
RUN chmod 640 ./themes/*
RUN chmod 640 ./views/*

RUN chmod -R 740 ./app/*
RUN chmod -R 740 ./app/*
RUN chmod -R 644 ./public/*

RUN chmod 740 ecosystem.config.js
RUN chmod 640 package.json
RUN chmod 640 yarn.lock

RUN find . -type d -exec chmod 750 {} \;

EXPOSE 80
EXPOSE 443

CMD [ "pm2-docker" , "start", "ecosystem.config.js", "--env", "production" ]