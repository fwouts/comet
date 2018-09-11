import {
  ActionsObservable,
  combineEpics,
  ofType,
  StateObservable
} from "redux-observable";
import { empty, from, Observable } from "rxjs";
import { catchError, merge, mergeMap } from "rxjs/operators";
import { compareBranches, loadRefs } from "../github/loader";
import {
  Action,
  FetchComparisonAction,
  fetchComparisonAction,
  SelectBranchAction,
  updateComparisonAction,
  updateReleasesAction
} from "./actions";
import { State } from "./state";

const fetchReleasesEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_RELEASES"),
    mergeMap(fetchReleases)
  );

function fetchReleases(): Observable<Action> {
  return from([updateReleasesAction({ status: "loading" })]).pipe(
    merge(
      from(loadRefs()).pipe(
        mergeMap(refs =>
          from([
            updateReleasesAction({
              status: "loaded",
              refs
            })
          ])
        )
      )
    ),
    catchError(error => from([updateReleasesAction({ status: "failed" })]))
  );
}

const triggerFetchCommitsOnBranchSelectEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("SELECT_BRANCH"),
    mergeMap((action: SelectBranchAction) => {
      if (
        state$.value.releaseBranches.status !== "loaded" ||
        !state$.value.releaseBranches.selectedBranchName
      ) {
        return empty();
      }
      const branchIndex = state$.value.releaseBranches.refs.findIndex(
        r => r.name === action.branchName
      );
      if (branchIndex === state$.value.releaseBranches.refs.length - 1) {
        // Unfortunately we don't have any previous branch to compare to.
        return empty();
      }
      const olderBranchName =
        state$.value.releaseBranches.refs[branchIndex + 1].name;
      return from([fetchComparisonAction(action.branchName, olderBranchName)]);
    })
  );

const fetchCommitsEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_COMPARISON"),
    mergeMap((action: FetchComparisonAction) =>
      fetchComparison(action.branchName, action.olderBranchName)
    )
  );

// TODO: Consider only setting the comparison result if the branch is still selected.
function fetchComparison(
  branchName: string,
  olderBranchName: string
): Observable<Action> {
  return from([
    updateComparisonAction(branchName, { status: "loading", olderBranchName })
  ]).pipe(
    merge(
      from(compareBranches(olderBranchName, branchName)).pipe(
        mergeMap(comparison =>
          from([
            updateComparisonAction(branchName, {
              status: "loaded",
              olderBranchName,
              result: comparison
            })
          ])
        )
      )
    ),
    catchError(error =>
      from([
        updateComparisonAction(branchName, {
          status: "failed",
          olderBranchName
        })
      ])
    )
  );
}

export const rootEpic = combineEpics(
  fetchReleasesEpic,
  triggerFetchCommitsOnBranchSelectEpic,
  fetchCommitsEpic
);
