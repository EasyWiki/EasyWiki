FROM node

WORKDIR /var/easywiki

# Copy environment files
COPY package.json .
COPY ecosystem.config.js .
COPY tsconfig.json .

# Install EasyWiki
RUN npm install
RUN npm install pm2 typescript -g

# Copy source
COPY ./src ./src
COPY ./sass ./sass

# Copy all view files
COPY ./partials ./partials
COPY ./public ./public
COPY ./themes ./themes
COPY ./views ./views
COPY ./ssl  ./ssl

# Build source
RUN npm run build
RUN npm run build-css

# Add configuration files
COPY ./config ./config

EXPOSE 80
EXPOSE 443

CMD [ "node" , "app/app.js" ]