import {
  ActionsObservable,
  combineEpics,
  ofType,
  StateObservable
} from "redux-observable";
import { from, Observable } from "rxjs";
import { catchError, merge, mergeMap } from "rxjs/operators";
import { loadReleaseBranchNames } from "../github/loader";
import { Action, updateReleasesAction } from "./actions";
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
  return from([updateReleasesAction("loading")]).pipe(
    merge(
      from(loadReleaseBranchNames()).pipe(
        mergeMap(branchNames =>
          from([updateReleasesAction("loaded", branchNames)])
        )
      )
    ),
    catchError(error => from([updateReleasesAction("failed")]))
  );
}

export const rootEpic = combineEpics(fetchReleasesEpic);
