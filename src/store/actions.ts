import * as redux from "redux";
import { LoadingStatus } from "./state";

export type Action = FetchReleasesAction | UpdateReleasesAction;
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
  status: LoadingStatus;
  releaseBranchNames: string[];
}

export function updateReleasesAction(
  status: LoadingStatus,
  releaseBranchNames: string[] = []
): UpdateReleasesAction {
  return {
    type: "UPDATE_RELEASES",
    status,
    releaseBranchNames
  };
}
