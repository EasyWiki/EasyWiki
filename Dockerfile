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

ADD https://github.com/EasyWiki/EasyWiki-Themes/releases/download/V1.0/themes.zip .
RUN unzip -o themes.zip

# Build source
RUN npm run build
RUN npm run minify

# Copy configuration files
COPY ./config ./config

EXPOSE 80
EXPOSE 443

CMD [ "pm2-docker" , "start", "ecosystem.config.js", "--env", "production" ]