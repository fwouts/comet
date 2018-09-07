import { Action } from "./actions";
import { State } from "./state";

export const rootReducer = (
  state: State = {
    releaseBranches: {
      status: "loading",
      names: []
    }
  },
  action: Action
): State => {
  switch (action.type) {
    case "UPDATE_RELEASES":
      return {
        ...state,
        releaseBranches: {
          status: action.status,
          names: action.releaseBranchNames
        }
      };
    default:
      return state;
  }
};
