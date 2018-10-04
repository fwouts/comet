# Comet

[![Build](https://img.shields.io/circleci/project/github/zenclabs/comet.svg)](https://circleci.com/gh/zenclabs/comet)
[![Docker build](https://img.shields.io/docker/build/zenclabs/comet.svg)](https://hub.docker.com/r/zenclabs/comet/builds)

This is a dashboard to easily compare branches and tags for any GitHub repository.

## Setup

- Make sure [Docker](https://www.docker.com/get-started) is running on your computer.
- [Generate a GitHub API token](https://github.com/settings/tokens). Make sure to give it the `repo` permission, which is required to navigate through your repositories.
- Run the following command to start the dashboard:
  ```
  docker run -it -p 3080:80 -e GITHUB_TOKEN=....... zenclabs/comet
  ```
- Navigate to http://localhost:3080 to see the dashboard.

### Jira integration

If you'd like to automatically see the status of associated Jira tickets, you'll need to pass
a few additional environment variables through Docker:
- `JIRA_HOST`, for example if you use Jira Cloud `https://yourproject.atlassian.net`.
- `JIRA_EMAIL`, which is your Jira account.
- `JIRA_API_TOKEN`, see [official instructions](https://confluence.atlassian.com/cloud/api-tokens-938839638.html).
