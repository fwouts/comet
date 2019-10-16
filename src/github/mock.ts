import { MockableType } from "../testing/mock";
import { GitHubLoader } from "./interface";

export function mockGithubLoader(): MockableType<GitHubLoader> {
  return {
    loadSuggestedRepos: jest.fn(),
    loadRefs: jest.fn(),
    compareRefs: jest.fn()
  };
}
