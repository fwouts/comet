import produce from "immer";
import { isEqual } from "lodash";
import { Action } from "./actions";
import {
  CurrentRepoState,
  EMPTY_STATE,
  Loadable,
  ReposState,
  State
} from "./state";

export const rootReducer = (
  state: State = {
    repos: EMPTY_STATE
  },
  action: Action
): State => {
  return produce(state, draft => {
    draft.repos = reposReducer(draft.repos, action);
    draft.currentRepo = currentRepoReducer(draft.currentRepo, action);
  });
};

const reposReducer = (
  reposState: Loadable<ReposState>,
  action: Action
): Loadable<ReposState> => {
  switch (action.type) {
    case "UPDATE_REPOS":
      return action.repos;
    default:
      return reposState;
  }
};

const currentRepoReducer = (
  currentRepoState: CurrentRepoState | undefined,
  action: Action
): CurrentRepoState | undefined => {
  switch (action.type) {
    case "UPDATE_SELECTED_REPO":
      if (
        currentRepoState &&
        currentRepoState.owner === action.owner &&
        currentRepoState.repo === action.repo
      ) {
        return currentRepoState;
      }
      return {
        owner: action.owner,
        repo: action.repo,
        refs: EMPTY_STATE
      };
    case "UPDATE_REFS":
      if (!currentRepoState) {
        return currentRepoState;
      }
      return produce(currentRepoState, draft => {
        draft.refs = action.refs;
      });
    case "UPDATE_SELECTED_REF":
      if (!currentRepoState) {
        return {
          owner: action.owner,
          repo: action.repo,
          refs: EMPTY_STATE,
          selectedRefName: action.refName
        };
      }
      return produce(currentRepoState || { refs: EMPTY_STATE }, draft => {
        draft.owner = action.owner;
        draft.repo = action.repo;
        draft.selectedRefName = action.refName;
      });
    case "UPDATE_COMPARISON":
      if (!currentRepoState) {
        return currentRepoState;
      }
      return produce(currentRepoState, draft => {
        if (draft.selectedRefName === action.refName) {
          draft.comparison = action.comparison;
        }
      });
    case "UPDATE_JIRA_TICKETS":
      if (!currentRepoState) {
        return currentRepoState;
      }
      return produce(currentRepoState, draft => {
        if (
          draft.comparison &&
          draft.comparison.status === "loaded" &&
          isEqual(draft.comparison.result.addedCommits, action.commits)
        ) {
          draft.comparison.jiraTickets = action.jiraTickets;
        }
      });
    case "TOGGLE_RELEASE_NOTES":
      if (!currentRepoState) {
        return currentRepoState;
      }
      return produce(currentRepoState, draft => {
        if (draft.comparison && draft.comparison.status === "loaded") {
          draft.comparison.showReleaseNotes = !draft.comparison
            .showReleaseNotes;
        }
      });
    default:
      return currentRepoState;
  }
};
