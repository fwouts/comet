# Comet

This is a dashboard to easily compare branches and tags for any GitHub repository.

## Instructions

_Note: installation steps will soon be a lot more straightforward._

### 1. Install Yarn

Follow the [official instructions](https://yarnpkg.com/en/docs/install).

### 2. Clone the repository

```
git clone https://github.com/zenclabs/comet.git
cd comet
yarn install
```

### 3. Create a file called `src/config.ts`

Your config file will contain your GitHub API token, generated from
https://github.com/settings/tokens with the "repo" permission

```
export const GITHUB_TOKEN = "=.......................";
```

If you'd like to automatically see the status of associated Jira tickets, add the following constants (optional):

```
// Jira host (example below if you use Jira Cloud).
export const JIRA_HOST = "https://[jira-project].atlassian.net";

// If you use Jira Cloud, you'll need to set up a proxy, started with `yarn jira-proxy`.
// Upvote https://jira.atlassian.com/browse/JRACLOUD-30371 if you'd like this fixed.
export const JIRA_PROXIED_HOST = "http://localhost:3001";

// Your Jira email account.
export const JIRA_EMAIL = "you@domain.com";

// A Jira API token. See https://confluence.atlassian.com/cloud/api-tokens-938839638.html.
export const JIRA_API_TOKEN = "............";
```

### 4. Start the local server

```
yarn start
```

Comet will then be available at http://localhost:3000.
