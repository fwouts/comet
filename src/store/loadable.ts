export type Loadable<T, S = {}> = (
  | EmptyState
  | LoadingState
  | LoadedState<T>
  | FailedState) &
  S;

export interface EmptyState {
  readonly status: Empty;
}

export const EMPTY_STATE: EmptyState = {
  status: "empty"
};

export interface LoadedState<T> {
  readonly status: Loaded;
  readonly loaded: T;
}

export interface LoadingState {
  readonly status: Loading;
}

export const LOADING_STATE: LoadingState = {
  status: "loading"
};

export interface FailedState {
  readonly status: Failed;
}

export const FAILED_STATE: FailedState = {
  status: "failed"
};

export type Empty = "empty";

export type Loading = "loading";

export type Loaded = "loaded";

export type Failed = "failed";
