import { Action } from "./actions";
import { State } from "./state";

export const rootReducer = (
  state: State = {
    refs: {
      status: "loading"
    }
  },
  action: Action
): State => {
  switch (action.type) {
    case "UPDATE_REFS":
      return {
        ...state,
        refs: action.refs
      };
    case "SELECT_REF":
      if (state.refs && state.refs.status === "loaded") {
        return {
          ...state,
          refs: {
            ...state.refs,
            selectedRefName: action.refName
          }
        };
      }
      return state;
    case "UPDATE_COMPARISON":
      if (
        state.refs &&
        state.refs.status === "loaded" &&
        state.refs.selectedRefName === action.refName
      ) {
        return {
          ...state,
          refs: {
            ...state.refs,
            comparison: action.comparison
          }
        };
      }
      return state;
    default:
      return state;
  }
};
