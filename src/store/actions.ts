import * as redux from "redux";
import { CommitsState, Loadable, RefsState, ReposState } from "./state";

export type Action =
  | FetchReposAction
  | UpdateReposAction
  | FetchRefsAction
  | UpdateRefsAction
  | SelectRefAction
  | FetchComparisonAction
  | UpdateComparisonAction;
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

export interface FetchRefsAction {
  type: "FETCH_REFS";
}

export function fetchRefsAction(): FetchRefsAction {
  return {
    type: "FETCH_REFS"
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
