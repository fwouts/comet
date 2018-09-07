import { Action } from "./actions";
import { State } from "./state";

export const rootReducer = (
  state: State = {
    releaseBranches: {
      status: "loading"
    }
  },
  action: Action
): State => {
  switch (action.type) {
    case "UPDATE_RELEASES":
      return {
        ...state,
        releaseBranches: action.releaseBranches
      };
    case "SELECT_BRANCH":
      if (state.releaseBranches && state.releaseBranches.status === "loaded") {
        return {
          ...state,
          releaseBranches: {
            ...state.releaseBranches,
            selectedBranchName: action.branchName
          }
        };
      }
      return state;
    default:
      return state;
  }
};
