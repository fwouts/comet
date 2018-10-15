import { push, RouterAction } from "connected-react-router";
import {
  ActionsObservable,
  combineEpics,
  ofType,
  StateObservable
} from "redux-observable";
import { empty, from, Observable, of } from "rxjs";
import { catchError, merge, mergeMap } from "rxjs/operators";
import {
  Commit,
  compareRefs,
  loadRefs,
  loadSuggestedRepos
} from "../github/loader";
import { extractJiraKey } from "../jira/key";
import { JiraTicket, loadTickets } from "../jira/loader";
import { producePath } from "../routing";
import {
  Action,
  FetchJiraTicketsAction,
  fetchJiraTicketsAction,
  fetchRefsAction,
  FetchRefsAction,
  NavigateToRefAction,
  NavigateToRepoAction,
  updateComparisonAction,
  updateJiraTicketsAction,
  updateRefsAction,
  updateReposAction,
  UpdateSelectedRefAction,
  UpdateSelectedRepoAction
} from "./actions";
import { CurrentRepoState, EMPTY_STATE, State } from "./state";

const fetchReposEpic = (
  action$: ActionsObservable<Action>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_REPOS"),
    mergeMap(fetchRepos)
  );

function fetchRepos(): Observable<Action> {
  return from([updateReposAction({ status: "loading" })]).pipe(
    merge(
      from(loadSuggestedRepos()).pipe(
        mergeMap(suggested =>
          from([
            updateReposAction({
              status: "loaded",
              loaded: {
                suggested
              }
            })
          ])
        )
      )
    ),
    catchError(error => from([updateReposAction({ status: "failed" })]))
  );
}

const navigateToRepoEpic = (
  action$: ActionsObservable<Action>
): Observable<RouterAction> =>
  action$.pipe(
    ofType("NAVIGATE_TO_REPO"),
    mergeMap((action: NavigateToRepoAction) => {
      return of(push(producePath(action.owner, action.repo)));
    })
  );

const triggerFetchRefsOnRepoUpdatedEpic = (
  action$: ActionsObservable<Action>
): Observable<Action> =>
  action$.pipe(
    ofType("UPDATE_SELECTED_REPO"),
    mergeMap((action: UpdateSelectedRepoAction) => {
      return from([fetchRefsAction(action.owner, action.repo)]);
    })
  );

const fetchRefsEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_REFS"),
    mergeMap((action: FetchRefsAction) => {
      return fetchRefs(action.owner, action.repo, state$.value.currentRepo);
    })
  );

function fetchRefs(
  owner: string,
  repo: string,
  currentRepo?: CurrentRepoState
): Observable<Action> {
  if (currentRepo && currentRepo.owner === owner && currentRepo.repo === repo) {
    if (
      currentRepo.refs.status === "loading" ||
      currentRepo.refs.status === "loaded"
    ) {
      return empty();
    }
  }
  return from([updateRefsAction({ status: "loading" })]).pipe(
    merge(
      from(loadRefs(owner, repo)).pipe(
        mergeMap(refs =>
          from([
            updateRefsAction({
              status: "loaded",
              loaded: {
                refs
              }
            })
          ])
        )
      )
    ),
    catchError(error => from([updateRefsAction({ status: "failed" })]))
  );
}

const navigateToRefEpic = (
  action$: ActionsObservable<Action>
): Observable<RouterAction> =>
  action$.pipe(
    ofType("NAVIGATE_TO_REF"),
    mergeMap((action: NavigateToRefAction) => {
      return of(
        push(
          producePath(
            action.owner,
            action.repo,
            action.refName,
            action.compareToRefName
          )
        )
      );
    })
  );

const triggerFetchCommitsOnRefSelectEpic = (
  action$: ActionsObservable<Action>
): Observable<Action> =>
  action$.pipe(
    ofType("UPDATE_SELECTED_REF"),
    mergeMap((action: UpdateSelectedRefAction) => {
      return fetchComparison(
        action.owner,
        action.repo,
        action.refName,
        action.compareToRefName
      );
    })
  );

// TODO: Consider only setting the comparison result if the ref is still selected.
function fetchComparison(
  owner: string,
  repo: string,
  refName: string,
  compareToRefName: string
): Observable<Action> {
  return from([
    updateComparisonAction(refName, { status: "loading", compareToRefName })
  ]).pipe(
    merge(
      from(compareRefs(owner, repo, compareToRefName, refName)).pipe(
        mergeMap(comparison =>
          from([
            updateComparisonAction(refName, {
              status: "loaded",
              compareToRefName,
              loaded: {
                result: comparison,
                jiraTickets: EMPTY_STATE,
                showReleaseNotes: false
              }
            }),
            fetchJiraTicketsAction(comparison.addedCommits)
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

const fetchJiraTicketsEpic = (
  action$: ActionsObservable<Action>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_JIRA_TICKETS"),
    mergeMap((action: FetchJiraTicketsAction) =>
      fetchJiraTickets(action.commits)
    )
  );

function fetchJiraTickets(commits: Commit[]): Observable<Action> {
  return from([
    updateJiraTicketsAction(commits, {
      status: "loading"
    })
  ]).pipe(
    merge(
      from(loadJiraTickets(commits)).pipe(
        mergeMap(jiraTickets =>
          from([
            updateJiraTicketsAction(commits, {
              status: "loaded",
              loaded: {
                jiraTickets
              }
            })
          ])
        )
      )
    ),
    catchError(error =>
      from([
        updateJiraTicketsAction(commits, {
          status: "failed"
        })
      ])
    )
  );
}

async function loadJiraTickets(
  commits: Commit[]
): Promise<{ [jiraKey: string]: JiraTicket }> {
  const jiraKeys = commits.map(commit => extractJiraKey(commit.commit.message));
  const uniqueJiraKeys = new Set(jiraKeys.filter(k => k !== null)) as Set<
    string
  >;
  return loadTickets(Array.from(uniqueJiraKeys));
}

export const rootEpic = combineEpics(
  fetchReposEpic,
  navigateToRepoEpic,
  triggerFetchRefsOnRepoUpdatedEpic,
  fetchRefsEpic,
  navigateToRefEpic,
  triggerFetchCommitsOnRefSelectEpic,
  fetchJiraTicketsEpic
);
