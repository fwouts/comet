import { mockGithubLoader } from "../github/mock";
import { Ref, RepoState } from "./repo";

describe("RepoState", () => {
  describe("fetchRefs", () => {
    it("loads successfully", async () => {
      const githubLoader = mockGithubLoader();
      const repo = new RepoState(githubLoader, null, "airtasker", "comet");
      const refs: Ref[] = [
        {
          kind: "branch",
          name: "mobx"
        },
        {
          kind: "tag",
          name: "v1.0"
        }
      ];
      githubLoader.loadRefs.mockResolvedValue(refs);

      expect(repo.refs).toEqual({
        status: "empty"
      });
      const promise = repo.fetchRefs();
      expect(repo.refs).toEqual({
        status: "loading"
      });
      await promise;
      expect(repo.refs).toEqual({
        status: "loaded",
        loaded: refs
      });
    });

    it("handles errors gracefully", async () => {
      const githubLoader = mockGithubLoader();
      const repo = new RepoState(githubLoader, null, "airtasker", "comet");
      githubLoader.loadRefs.mockRejectedValue(new Error());

      expect(repo.refs).toEqual({
        status: "empty"
      });
      const promise = repo.fetchRefs();
      expect(repo.refs).toEqual({
        status: "loading"
      });
      await promise;
      expect(repo.refs).toEqual({
        status: "failed"
      });
    });
  });

  describe("selectRef", () => {
    it("selects it", () => {
      const githubLoader = mockGithubLoader();
      const repo = new RepoState(githubLoader, null, "airtasker", "comet");

      expect(repo.selectedRefName).toBeNull();
      repo.selectRef("master");
      expect(repo.selectedRefName).toBe("master");
    });

    it("clears prior comparison", async () => {
      const githubLoader = mockGithubLoader();
      const repo = new RepoState(githubLoader, null, "airtasker", "comet");

      repo.selectRef("master");
      await repo.compareToAnotherRef("mobx");
      expect(repo.comparison).not.toBeNull();

      repo.selectRef("mobx");
      expect(repo.comparison).toBeNull();
    });
  });

  describe("compareToAnotherRef", () => {
    it("does nothing if no ref selected", () => {
      const githubLoader = mockGithubLoader();
      const repo = new RepoState(githubLoader, null, "airtasker", "comet");

      repo.compareToAnotherRef("mobx");
      expect(githubLoader.compareRefs).not.toHaveBeenCalled();
    });

    it("fetches the comparison", async () => {
      const githubLoader = mockGithubLoader();
      const repo = new RepoState(githubLoader, null, "airtasker", "comet");

      repo.selectRef("master");
      await repo.compareToAnotherRef("mobx");
      expect(repo.comparison).toMatchObject({
        owner: "airtasker",
        repo: "comet",
        refName: "master",
        compareToRefName: "mobx"
      });
      expect(githubLoader.compareRefs).toHaveBeenCalledWith(
        "airtasker",
        "comet",
        "mobx",
        "master"
      );
    });
  });
});
