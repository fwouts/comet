# Build the static website.
FROM node:10-alpine as builder
RUN apk add gettext
WORKDIR /comet-build
COPY package.json yarn.lock ./
RUN yarn install
COPY . .

# Set environment variables to a dummy value.
#
# This will be replaced on server startup (see docker-entrypoint.sh).
ENV REACT_APP_GITHUB_TOKEN "\$REPLACE_ME_GITHUB_TOKEN"
ENV REACT_APP_JIRA_HOST "\$REPLACE_ME_JIRA_HOST"
ENV REACT_APP_JIRA_EMAIL "\$REPLACE_ME_JIRA_EMAIL"
ENV REACT_APP_JIRA_TOKEN "\$REPLACE_ME_JIRA_TOKEN"

# Build the optimised app.
RUN yarn build

# Serve it from Nginx.
FROM nginx:1.15.3-alpine
WORKDIR /srv/comet
COPY --from=builder /comet-build/build .
COPY docker-entrypoint.sh nginx.conf.template ./
EXPOSE 80

# Start the server.
ENTRYPOINT [ "./docker-entrypoint.sh" ]
