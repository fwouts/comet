import produce from "immer";
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
      return produce(state, draft => {
        draft.repos = action.repos;
      });
    case "SELECT_REPO":
      return produce(state, draft => {
        draft.currentRepo = {
          owner: action.owner,
          repo: action.repo,
          refs: EMPTY_STATE
        };
      });
    case "UPDATE_REFS":
      return produce(state, draft => {
        if (draft.currentRepo) {
          draft.currentRepo.refs = action.refs;
        }
      });
    case "SELECT_REF":
      return produce(state, draft => {
        if (
          draft.currentRepo &&
          draft.currentRepo.refs &&
          draft.currentRepo.refs.status === "loaded"
        ) {
          draft.currentRepo.refs.selectedRefName = action.refName;
        }
      });
    case "UPDATE_COMPARISON":
      return produce(state, draft => {
        if (
          draft.currentRepo &&
          draft.currentRepo.refs &&
          draft.currentRepo.refs.status === "loaded" &&
          draft.currentRepo.refs.selectedRefName === action.refName
        ) {
          draft.currentRepo.refs.comparison = action.comparison;
        }
      });
    default:
      return state;
  }
};
