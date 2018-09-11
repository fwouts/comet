import { CompareBranchesResult } from "../github/loader";

export type Loadable<T, S = {}> = (
  | LoadingState
  | (LoadedState & T)
  | FailedState) &
  S;

export interface LoadedState {
  status: Loaded;
}

export interface LoadingState {
  status: Loading;
}

export interface FailedState {
  status: Failed;
}

export interface State {
  releaseBranches: Loadable<ReleaseBranchesState>;
}

export interface ReleaseBranchesState {
  names: string[];
  selectedBranchName?: string;
  comparison?: CommitsState;
}

export type CommitsState = Loadable<
  {
    result: CompareBranchesResult;
  },
  {
    olderBranchName: string;
  }
>;

export type LoadingStatus = Loading | Loaded | Failed;

export type Loading = "loading";

export type Loaded = "loaded";

export type Failed = "failed";
