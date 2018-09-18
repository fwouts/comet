import { Action } from "./actions";
import { EMPTY_STATE, State } from "./state";

export const rootReducer = (
  state: State = {
    repos: EMPTY_STATE
  },
  action: Action
): State => {
  switch (action.type) {
    case "UPDATE_REPOS":
      return {
        ...state,
        repos: action.repos
      };
    case "SELECT_REPO":
      return {
        ...state,
        currentRepo: {
          owner: action.owner,
          repo: action.repo,
          refs: EMPTY_STATE
        }
      };
    case "UPDATE_REFS":
      if (!state.currentRepo) {
        return state;
      }
      return {
        ...state,
        currentRepo: {
          ...state.currentRepo,
          refs: action.refs
        }
      };
    case "SELECT_REF":
      if (
        !state.currentRepo ||
        !state.currentRepo.refs ||
        state.currentRepo.refs.status !== "loaded"
      ) {
        return state;
      }
      return {
        ...state,
        currentRepo: {
          ...state.currentRepo,
          refs: {
            ...state.currentRepo.refs,
            selectedRefName: action.refName
          }
        }
      };
    case "UPDATE_COMPARISON":
      if (
        !state.currentRepo ||
        !state.currentRepo.refs ||
        state.currentRepo.refs.status !== "loaded" ||
        state.currentRepo.refs.selectedRefName !== action.refName
      ) {
        return state;
      }
      return {
        ...state,
        currentRepo: {
          ...state.currentRepo,
          refs: {
            ...state.currentRepo.refs,
            comparison: action.comparison
          }
        }
      };
    default:
      return state;
  }
};
