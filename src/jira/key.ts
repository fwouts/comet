export function extractJiraKey(message: string): string | null {
  const JIRA_KEY_REGEX = /(\w+-\d+)/;
  const match = JIRA_KEY_REGEX.exec(message);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}
