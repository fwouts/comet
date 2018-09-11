import * as redux from "redux";
import { CommitsState, Loadable, RefsState } from "./state";

export type Action =
  | FetchRefsAction
  | UpdateRefsAction
  | SelectRefAction
  | FetchComparisonAction
  | UpdateComparisonAction;
export type Dispatch = redux.Dispatch<Action>;

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
