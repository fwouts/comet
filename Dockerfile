# Build the static website.
FROM node:10.11.0-alpine as builder
RUN apk add gettext
WORKDIR /comet-build
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
COPY config.ts.template /comet-build/src/config.ts
RUN yarn build

# Serve it from Nginx.
FROM nginx:1.15.3-alpine
WORKDIR /srv/comet
COPY --from=builder /comet-build/build .
COPY nginx.conf.template nginx.conf.template
EXPOSE 80

# Dynamically use Jira and GitHub configuration from environment.
CMD [ "sh", "-c", "export JIRA_HOST=${JIRA_HOST:-http://localhost/ignore} && (envsubst '$JIRA_HOST' < nginx.conf.template > /etc/nginx/nginx.conf) && JS_FILE=$(ls static/js/*.js) && (envsubst '$GITHUB_TOKEN,$JIRA_HOST,$JIRA_EMAIL,$JIRA_API_TOKEN' < $JS_FILE > $JS_FILE) && nginx -g daemon\\ off\\;" ]
