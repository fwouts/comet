import { CompareRefsResult, Repo } from "../github/loader";
import { JiraTicket } from "../jira/loader";

export interface State {
  readonly repos: Loadable<ReposState>;
  readonly currentRepo?: CurrentRepoState;
}

export interface ReposState {
  readonly suggested: Repo[];
}

export interface CurrentRepoState {
  readonly owner: string;
  readonly repo: string;
  readonly refs: Loadable<RefsState>;
  readonly selectedRefName?: string;
  readonly comparison?: ComparisonState;
}

export interface RefsState {
  readonly refs: Ref[];
}

export type Ref = Branch | Tag;

export interface Branch {
  readonly kind: "branch";
  readonly name: string;
}

export interface Tag {
  readonly kind: "tag";
  readonly name: string;
}

export type ComparisonState = Loadable<
  {
    readonly result: CompareRefsResult;
    readonly jiraTickets: Loadable<JiraTicketsState>;
    readonly showReleaseNotes: boolean;
  },
  {
    readonly compareToRefName: string;
  }
>;

export interface JiraTicketsState {
  jiraTickets: {
    [jiraKey: string]: JiraTicket;
  };
}

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
