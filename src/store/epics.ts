import {
  ActionsObservable,
  combineEpics,
  ofType,
  StateObservable
} from "redux-observable";
import { empty, from, Observable } from "rxjs";
import { catchError, merge, mergeMap } from "rxjs/operators";
import { compareRefs, loadRefs } from "../github/loader";
import {
  Action,
  FetchComparisonAction,
  fetchComparisonAction,
  SelectRefAction,
  updateComparisonAction,
  updateRefsAction
} from "./actions";
import { State } from "./state";

const fetchRefsEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_REFS"),
    mergeMap(fetchRefs)
  );

function fetchRefs(): Observable<Action> {
  return from([updateRefsAction({ status: "loading" })]).pipe(
    merge(
      from(loadRefs()).pipe(
        mergeMap(refs =>
          from([
            updateRefsAction({
              status: "loaded",
              refs
            })
          ])
        )
      )
    ),
    catchError(error => from([updateRefsAction({ status: "failed" })]))
  );
}

const triggerFetchCommitsOnRefSelectEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("SELECT_REF"),
    mergeMap((action: SelectRefAction) => {
      if (
        state$.value.refs.status !== "loaded" ||
        !state$.value.refs.selectedRefName
      ) {
        return empty();
      }
      const refIndex = state$.value.refs.refs.findIndex(
        r => r.name === action.refName
      );
      if (refIndex === state$.value.refs.refs.length - 1) {
        // Unfortunately we don't have any previous ref to compare to.
        return empty();
      }
      const compareToRefName = state$.value.refs.refs[refIndex + 1].name;
      return from([fetchComparisonAction(action.refName, compareToRefName)]);
    })
  );

const fetchCommitsEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_COMPARISON"),
    mergeMap((action: FetchComparisonAction) =>
      fetchComparison(action.refName, action.compareToRefName)
    )
  );

// TODO: Consider only setting the comparison result if the ref is still selected.
function fetchComparison(
  refName: string,
  compareToRefName: string
): Observable<Action> {
  return from([
    updateComparisonAction(refName, { status: "loading", compareToRefName })
  ]).pipe(
    merge(
      from(compareRefs(compareToRefName, refName)).pipe(
        mergeMap(comparison =>
          from([
            updateComparisonAction(refName, {
              status: "loaded",
              compareToRefName,
              result: comparison
            })
          ])
        )
      )
    ),
    catchError(error =>
      from([
        updateComparisonAction(refName, {
          status: "failed",
          compareToRefName
        })
      ])
    )
  );
}

export const rootEpic = combineEpics(
  fetchRefsEpic,
  triggerFetchCommitsOnRefSelectEpic,
  fetchCommitsEpic
);
