import * as config from "../config";

// Jira configuration is optional.
const rawConfig = config as any;

export const jiraConfig = rawConfig.JIRA_HOST
  ? (rawConfig as JiraConfig)
  : null;

export interface JiraConfig {
  JIRA_HOST: string;
  JIRA_PROXIED_HOST: string;
  JIRA_EMAIL: string;
  JIRA_API_TOKEN: string;
}

export const HELPFUL_JIRA_ERROR_MESSAGE = `To leverage Jira's API, please make sure to include the following constants in config.ts:
- JIRA_HOST
- JIRA_PROXIED_HOST
- JIRA_EMAIL
- JIRA_API_TOKEN

Refer to README.md for more information.
`;
