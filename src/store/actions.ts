import * as redux from "redux";
import { Commit } from "../github/loader";
import {
  CommitsState,
  JiraTicketsState,
  Loadable,
  RefsState,
  ReposState
} from "./state";

export type Action =
  | FetchReposAction
  | UpdateReposAction
  | SelectRepoAction
  | FetchRefsAction
  | UpdateRefsAction
  | SelectRefAction
  | FetchComparisonAction
  | UpdateComparisonAction
  | FetchJiraTicketsAction
  | UpdateJiraTicketsAction;
export type Dispatch = redux.Dispatch<Action>;

export interface FetchReposAction {
  type: "FETCH_REPOS";
}

export function fetchReposAction(): FetchReposAction {
  return {
    type: "FETCH_REPOS"
  };
}

export interface UpdateReposAction {
  type: "UPDATE_REPOS";
  repos: Loadable<ReposState>;
}

export function updateReposAction(
  repos: Loadable<ReposState>
): UpdateReposAction {
  return {
    type: "UPDATE_REPOS",
    repos
  };
}

export interface SelectRepoAction {
  type: "SELECT_REPO";
  owner: string;
  repo: string;
}

export function selectRepoAction(
  owner: string,
  repo: string
): SelectRepoAction {
  return {
    type: "SELECT_REPO",
    owner,
    repo
  };
}

export interface FetchRefsAction {
  type: "FETCH_REFS";
  owner: string;
  repo: string;
}

export function fetchRefsAction(owner: string, repo: string): FetchRefsAction {
  return {
    type: "FETCH_REFS",
    owner,
    repo
  };
}

export interface UpdateRefsAction {
  type: "UPDATE_REFS";
  refs: Loadable<RefsState>;
}

export function updateRefsAction(refs: Loadable<RefsState>): UpdateRefsAction {
  return {
    type: "UPDATE_REFS",
    refs
  };
}

export interface SelectRefAction {
  type: "SELECT_REF";
  refName: string;
}

export function selectRefAction(refName: string): SelectRefAction {
  return {
    type: "SELECT_REF",
    refName
  };
}

export interface FetchComparisonAction {
  type: "FETCH_COMPARISON";
  refName: string;
  compareToRefName: string;
}

export function fetchComparisonAction(
  refName: string,
  compareToRefName: string
): FetchComparisonAction {
  return {
    type: "FETCH_COMPARISON",
    refName,
    compareToRefName
  };
}

export interface UpdateComparisonAction {
  type: "UPDATE_COMPARISON";
  refName: string;
  comparison: CommitsState;
}

export function updateComparisonAction(
  refName: string,
  comparison: CommitsState
): UpdateComparisonAction {
  return {
    type: "UPDATE_COMPARISON",
    refName,
    comparison
  };
}

export interface FetchJiraTicketsAction {
  type: "FETCH_JIRA_TICKETS";
  commits: Commit[];
}

export function fetchJiraTicketsAction(
  commits: Commit[]
): FetchJiraTicketsAction {
  return {
    type: "FETCH_JIRA_TICKETS",
    commits
  };
}

export interface UpdateJiraTicketsAction {
  type: "UPDATE_JIRA_TICKETS";
  commits: Commit[];
  jiraTickets: Loadable<JiraTicketsState>;
}

export function updateJiraTicketsAction(
  commits: Commit[],
  jiraTickets: Loadable<JiraTicketsState>
): UpdateJiraTicketsAction {
  return {
    type: "UPDATE_JIRA_TICKETS",
    commits,
    jiraTickets
  };
}
