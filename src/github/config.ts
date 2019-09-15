export function githubConfig() {
  const apiToken = process.env.REACT_APP_GITHUB_TOKEN;
  if (!apiToken) {
    throw new Error(
      `Please set the REACT_APP_GITHUB_TOKEN environment variable.`
    );
  }
  return {
    apiToken
  };
}

export type GitHubConfig = ReturnType<typeof githubConfig>;
