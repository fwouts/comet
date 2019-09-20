import { mockGithubLoader } from "../github/mock";
import { AppState } from "./app";

describe("AppState", () => {
  describe("fetchRepos", () => {
    it("loads successfully", async () => {
      const githubLoader = mockGithubLoader();
      const app = new AppState(githubLoader, null);
      const repos = [
        {
          owner: "airtasker",
          repo: "comet"
        },
        {
          owner: "airtasker",
          repo: "spot"
        },
        {
          owner: "airtasker",
          repo: "proxay"
        }
      ];
      githubLoader.loadSuggestedRepos.mockReturnValue(Promise.resolve(repos));

      expect(app.suggestedRepositories).toEqual({
        status: "empty"
      });
      const promise = app.fetchRepos();
      expect(app.suggestedRepositories).toEqual({
        status: "loading"
      });
      await promise;
      expect(app.suggestedRepositories).toEqual({
        status: "loaded",
        loaded: repos
      });
    });

    it("handles errors gracefully", async () => {
      const githubLoader = mockGithubLoader();
      const app = new AppState(githubLoader, null);
      githubLoader.loadSuggestedRepos.mockRejectedValue(new Error());

      expect(app.suggestedRepositories).toEqual({
        status: "empty"
      });
      const promise = app.fetchRepos();
      expect(app.suggestedRepositories).toEqual({
        status: "loading"
      });
      await promise;
      expect(app.suggestedRepositories).toEqual({
        status: "failed"
      });
    });
  });

  describe("selectRepo", () => {
    it("selects the repository", async () => {
      const githubLoader = mockGithubLoader();
      const app = new AppState(githubLoader, null);
      await app.selectRepo("airtasker", "comet");

      expect(app.currentRepo).toMatchObject({
        owner: "airtasker",
        repo: "comet"
      });
      expect(githubLoader.loadRefs).toHaveBeenCalledWith("airtasker", "comet");
    });

    it("does not reload repository if the same is selected", async () => {
      const githubLoader = mockGithubLoader();
      const app = new AppState(githubLoader, null);
      await app.selectRepo("airtasker", "comet");
      const repoBeforeSecondSelection = app.currentRepo;
      await app.selectRepo("airtasker", "comet");
      expect(app.currentRepo).toBe(repoBeforeSecondSelection);
      expect(githubLoader.loadRefs).toHaveBeenCalledTimes(1);
    });

    it("loads repository if a different one is selected", async () => {
      const githubLoader = mockGithubLoader();
      const app = new AppState(githubLoader, null);
      await app.selectRepo("airtasker", "comet");
      await app.selectRepo("airtasker", "proxay");
      expect(app.currentRepo).toMatchObject({
        owner: "airtasker",
        repo: "proxay"
      });
      expect(githubLoader.loadRefs).toHaveBeenCalledTimes(2);
    });
  });
});
