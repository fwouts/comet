import * as redux from "redux";
import { ReleaseBranchesState } from "./state";

export type Action =
  | FetchReleasesAction
  | UpdateReleasesAction
  | SelectBranchAction;
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
  releaseBranches: ReleaseBranchesState;
}

export function updateReleasesAction(
  releaseBranches: ReleaseBranchesState
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
