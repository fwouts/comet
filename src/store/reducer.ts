import produce from "immer";
import { isEqual } from "lodash";
import { Action } from "./actions";
import {
  CurrentRepoState,
  EMPTY_STATE,
  Loadable,
  RefsState,
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
    default:
      if (currentRepoState) {
        return produce(currentRepoState, draft => {
          draft.refs = refsReducer(currentRepoState.refs, action);
        });
      }
      return currentRepoState;
  }
};

const refsReducer = (
  refsState: Loadable<RefsState>,
  action: Action
): Loadable<RefsState> => {
  switch (action.type) {
    case "UPDATE_REFS":
      return action.refs;
    case "SELECT_REF":
      return produce(refsState, draft => {
        if (draft.status === "loaded") {
          draft.selectedRefName = action.refName;
        }
      });
    case "UPDATE_COMPARISON":
      return produce(refsState, draft => {
        if (
          draft.status === "loaded" &&
          draft.selectedRefName === action.refName
        ) {
          draft.comparison = action.comparison;
        }
      });
    case "UPDATE_JIRA_TICKETS":
      return produce(refsState, draft => {
        if (
          draft.status === "loaded" &&
          draft.comparison &&
          draft.comparison.status === "loaded" &&
          isEqual(draft.comparison.result.addedCommits, action.commits)
        ) {
          draft.comparison.jiraTickets = action.jiraTickets;
        }
      });
    default:
      return refsState;
  }
};
