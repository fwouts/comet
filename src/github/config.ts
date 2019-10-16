import Octokit from "@octokit/rest";

export function authenticateGitHub() {
  const octokit = new Octokit();
  octokit.authenticate({
    type: "token",
    token: githubConfig().apiToken
  });
  return octokit;
}

function githubConfig() {
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
