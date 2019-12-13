FROM node

WORKDIR /var/easywiki

# Copy environment files
COPY package.json .
COPY package-lock.json .
COPY ecosystem.config.js .
COPY tsconfig.json .

# Install EasyWiki
RUN npm install
RUN npm install pm2 typescript -g

# Copy source
COPY ./src ./src
COPY ./sass ./sass

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

# Build source
RUN npm run build
RUN npm run build-css

# Copy configuration files
COPY ./config ./config

EXPOSE 80
EXPOSE 443

CMD [ "pm2-docker" , "start", "ecosystem.config.js", "--env", "production" ]