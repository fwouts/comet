#!/bin/sh

# Fail early if any errors occur.
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  >&2 echo "Please set the GITHUB_TOKEN environment variable."
  exit 1
fi

if [ -z "$JIRA_HOST" ] || [ -z "$JIRA_EMAIL" ] || [ -z "$JIRA_TOKEN" ]; then
  echo "At least one of JIRA_HOST, JIRA_EMAIL or JIRA_TOKEN environment variables was not set. Comet will ignore Jira tickets."
fi

# Replace dummy values with ones from the environment.
export REPLACE_ME_GITHUB_TOKEN="$GITHUB_TOKEN"
export REPLACE_ME_JIRA_HOST="$JIRA_HOST"
export REPLACE_ME_JIRA_EMAIL="$JIRA_EMAIL"
export REPLACE_ME_JIRA_TOKEN="$JIRA_TOKEN"
for js_file in static/js/*.js; do
  envsubst '$REPLACE_ME_GITHUB_TOKEN,$REPLACE_ME_JIRA_HOST,$REPLACE_ME_JIRA_EMAIL,$REPLACE_ME_JIRA_TOKEN' < $js_file > $js_file
done

# Set JIRA_HOST in the Nginx config.
export JIRA_HOST=${JIRA_HOST:-http://localhost/ignore}
envsubst '$JIRA_HOST' < nginx.conf.template > /etc/nginx/nginx.conf

# Start the Nginx server.
nginx -g "daemon off;"
