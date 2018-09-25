# Build the static website.
FROM node:10.11.0-alpine as builder
RUN apk add gettext
WORKDIR /comet-build
COPY . .
ARG GITHUB_TOKEN
ARG JIRA_HOST
ARG JIRA_EMAIL
ARG JIRA_API_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV JIRA_HOST=${JIRA_HOST}
ENV JIRA_EMAIL=${JIRA_EMAIL}
ENV JIRA_API_TOKEN=${JIRA_API_TOKEN}
RUN envsubst < config.ts.template > /comet-build/src/config.ts
RUN yarn build

# Serve it from Nginx.
FROM nginx:1.15.3-alpine
WORKDIR /srv/comet
COPY --from=builder /comet-build/build .
COPY nginx.conf.template nginx.conf.template
ARG JIRA_HOST
ENV JIRA_HOST=${JIRA_HOST}
RUN envsubst < nginx.conf.template > /etc/nginx/nginx.conf
RUN rm nginx.conf.template
EXPOSE 80
