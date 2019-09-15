export function jiraConfig() {
  // Note: We could have merged extractJiraConfig() with this function. However,
  // Webpack would optimise this too much and never return null when we set the
  // values to placeholder values (e.g. "$REPLACE_ME_GITHUB_TOKEN").
  const config = extractJiraConfig();
  if (!config.host || !config.email || !config.apiToken) {
    return null;
  }
  return config;
}

function extractJiraConfig() {
  const host = process.env.REACT_APP_JIRA_HOST;
  const email = process.env.REACT_APP_JIRA_EMAIL;
  const apiToken = process.env.REACT_APP_JIRA_TOKEN;
  return {
    host,
    email,
    apiToken
  };
}

export type JiraConfig = ReturnType<typeof extractJiraConfig>;

export const HELPFUL_JIRA_ERROR_MESSAGE = `To leverage Jira's API, please make sure to include the following environment variables:
- REACT_APP_JIRA_HOST
- REACT_APP_JIRA_EMAIL
- REACT_APP_JIRA_TOKEN

Refer to README.md for more information.
`;
