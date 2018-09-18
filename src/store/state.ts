import { CompareRefsResult, Repo } from "../github/loader";

export type Loadable<T, S = {}> = (
  | EmptyState
  | LoadingState
  | (LoadedState & T)
  | FailedState) &
  S;

export interface EmptyState {
  status: Empty;
}

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
  repos: Loadable<ReposState>;
  refs: Loadable<RefsState>;
}

export interface ReposState {
  suggested: Repo[];
}

export interface RefsState {
  refs: Ref[];
  selectedRefName?: string;
  comparison?: CommitsState;
}

export type Ref = Branch | Tag;

export interface Branch {
  kind: "branch";
  name: string;
}

export interface Tag {
  kind: "tag";
  name: string;
}

export type CommitsState = Loadable<
  {
    result: CompareRefsResult;
  },
  {
    compareToRefName: string;
  }
>;

export type Empty = "empty";

export type Loading = "loading";

export type Loaded = "loaded";

export type Failed = "failed";
