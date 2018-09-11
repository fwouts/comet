import * as redux from "redux";
import { CommitsState, Loadable, ReleaseBranchesState } from "./state";

export type Action =
  | FetchReleasesAction
  | UpdateReleasesAction
  | SelectBranchAction
  | FetchComparisonAction
  | UpdateComparisonAction;
export type Dispatch = redux.Dispatch<Action>;

export interface FetchReleasesAction {
  type: "FETCH_RELEASES";
}

export function fetchReleasesAction(): FetchReleasesAction {
  return {
    type: "FETCH_RELEASES"
  };
}

export interface UpdateReleasesAction {
  type: "UPDATE_RELEASES";
  releaseBranches: Loadable<ReleaseBranchesState>;
}

export function updateReleasesAction(
  releaseBranches: Loadable<ReleaseBranchesState>
): UpdateReleasesAction {
  return {
    type: "UPDATE_RELEASES",
    releaseBranches
  };
}

export interface SelectBranchAction {
  type: "SELECT_BRANCH";
  branchName: string;
}

export function selectBranchAction(branchName: string): SelectBranchAction {
  return {
    type: "SELECT_BRANCH",
    branchName
  };
}

export interface FetchComparisonAction {
  type: "FETCH_COMPARISON";
  branchName: string;
  olderBranchName: string;
}

export function fetchComparisonAction(
  branchName: string,
  olderBranchName: string
): FetchComparisonAction {
  return {
    type: "FETCH_COMPARISON",
    branchName,
    olderBranchName
  };
}

export interface UpdateComparisonAction {
  type: "UPDATE_COMPARISON";
  branchName: string;
  comparison: CommitsState;
}

export function updateComparisonAction(
  branchName: string,
  comparison: CommitsState
): UpdateComparisonAction {
  return {
    type: "UPDATE_COMPARISON",
    branchName,
    comparison
  };
}
