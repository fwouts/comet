import { CompareBranchesResult } from "../github/loader";

export interface State {
  releaseBranches: ReleaseBranchesState;
}

export type ReleaseBranchesState =
  | IncompleteReleaseBranchesState
  | LoadedReleaseBranchesState;

export interface IncompleteReleaseBranchesState {
  status: Loading | Failed;
}

export interface LoadedReleaseBranchesState {
  status: Loaded;
  names: string[];
  selectedBranchName?: string;
  comparison?: CommitsState;
}

export type CommitsState = IncompleteCommitsState | CompleteCommitsState;

export interface IncompleteCommitsState {
  status: Loading | Failed;
  olderBranchName: string;
}

export interface CompleteCommitsState {
  status: Loaded;
  olderBranchName: string;
  result: CompareBranchesResult;
}

export type LoadingStatus = Loading | Loaded | Failed;

export type Loading = "loading";

export type Loaded = "loaded";

export type Failed = "failed";
