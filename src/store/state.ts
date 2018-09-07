export interface State {
  releaseBranches: ReleaseBranchesState;
}

export interface ReleaseBranchesState {
  status: LoadingStatus;
  names: string[];
}

export type LoadingStatus = "loading" | "loaded" | "failed";
