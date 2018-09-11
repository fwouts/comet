import { CompareRefsResult } from "../github/loader";

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
  refs: Loadable<RefsState>;
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

export type LoadingStatus = Loading | Loaded | Failed;

export type Loading = "loading";

export type Loaded = "loaded";

export type Failed = "failed";
