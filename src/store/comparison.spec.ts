import { CompareRefsResult } from "../github/interface";
import { mockGithubLoader } from "../github/mock";
import { JiraTicketsByKey } from "../jira/interface";
import { mockJiraLoader } from "../jira/mock";
import { ComparisonState } from "./comparison";

const COMPARE_REFS_RESULT: CompareRefsResult = {
  aheadBy: 1,
  behindBy: 0,
  addedCommits: [
    {
      author: {
        login: "fwouts",
        avatar_url: "http://avatar"
      },
      commit: {
        author: {
          name: "Frank",
          email: "email"
        },
        message: "Hello, World!"
      },
      html_url: "http://abc",
      sha: "abc"
    }
  ],
  removedCommits: [],
  hadToOmitCommits: false
};

const JIRA_TICKETS: JiraTicketsByKey = {
  "COMET-123": {
    id: "123",
    key: "COMET-123",
    summary: "Comet 123",
    issueType: {
      name: "Task",
      iconUrl: "http://icon"
    },
    status: {
      name: "In progress",
      categoryKey: "IN-PROGRESS",
      categoryColor: "green"
    },
    commits: [
      {
        id: "abc",
        authorTimestamp: "21 September 2019",
        message: "Add a feature"
      }
    ]
  }
};

describe("ComparisonState", () => {
  describe("toggleReleaseNotes", () => {
    it("toggles", () => {
      const githubLoader = mockGithubLoader();
      const comparison = new ComparisonState(
        githubLoader,
        null,
        "airtasker",
        "comet",
        "master",
        "mobx"
      );
      expect(comparison.showReleaseNotes).toBe(false);
      comparison.toggleReleaseNotes();
      expect(comparison.showReleaseNotes).toBe(true);
      comparison.toggleReleaseNotes();
      expect(comparison.showReleaseNotes).toBe(false);
    });
  });

  describe("fetchResult", () => {
    it("loads from GitHub successfully", async () => {
      const githubLoader = mockGithubLoader();
      const comparison = new ComparisonState(
        githubLoader,
        null,
        "airtasker",
        "comet",
        "master",
        "mobx"
      );
      githubLoader.compareRefs.mockResolvedValue(COMPARE_REFS_RESULT);

      expect(comparison.result).toEqual({
        status: "empty"
      });
      const promise = comparison.fetchResult();
      expect(comparison.result).toEqual({
        status: "loading"
      });
      await promise;
      expect(comparison.result).toEqual({
        status: "loaded",
        loaded: COMPARE_REFS_RESULT
      });
    });

    it("handles GitHub loading errors gracefully", async () => {
      const githubLoader = mockGithubLoader();
      const comparison = new ComparisonState(
        githubLoader,
        null,
        "airtasker",
        "comet",
        "master",
        "mobx"
      );
      githubLoader.compareRefs.mockRejectedValue(new Error());

      expect(comparison.result).toEqual({
        status: "empty"
      });
      const promise = comparison.fetchResult();
      expect(comparison.result).toEqual({
        status: "loading"
      });
      await promise;
      expect(comparison.result).toEqual({
        status: "failed"
      });
    });

    it("does not fetch Jira tickets when result loaded but no Jira loader present", async () => {
      const githubLoader = mockGithubLoader();
      const comparison = new ComparisonState(
        githubLoader,
        null,
        "airtasker",
        "comet",
        "master",
        "mobx"
      );
      githubLoader.compareRefs.mockResolvedValue(COMPARE_REFS_RESULT);

      await comparison.fetchResult();
      expect(comparison.result.status).toBe("loaded");
      expect(comparison.jiraTickets).toEqual({
        status: "empty"
      });
    });

    it("loads Jira tickets successfully", async () => {
      const githubLoader = mockGithubLoader();
      const jiraLoader = mockJiraLoader();
      const comparison = new ComparisonState(
        githubLoader,
        jiraLoader,
        "airtasker",
        "comet",
        "master",
        "mobx"
      );
      githubLoader.compareRefs.mockResolvedValue(COMPARE_REFS_RESULT);
      jiraLoader.loadTickets.mockResolvedValue(JIRA_TICKETS);
      await comparison.fetchResult();
      expect(comparison.result.status).toBe("loaded");
      expect(comparison.jiraTickets).toEqual({
        status: "loaded",
        loaded: JIRA_TICKETS
      });
    });

    it("handles Jira loading errors gracefully", async () => {
      const githubLoader = mockGithubLoader();
      const jiraLoader = mockJiraLoader();
      const comparison = new ComparisonState(
        githubLoader,
        jiraLoader,
        "airtasker",
        "comet",
        "master",
        "mobx"
      );
      githubLoader.compareRefs.mockResolvedValue(COMPARE_REFS_RESULT);
      jiraLoader.loadTickets.mockRejectedValue(new Error());
      await comparison.fetchResult();
      expect(comparison.result.status).toBe("loaded");
      expect(comparison.jiraTickets).toEqual({
        status: "failed"
      });
    });
  });
});
