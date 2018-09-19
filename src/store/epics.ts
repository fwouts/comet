import {
  ActionsObservable,
  combineEpics,
  ofType,
  StateObservable
} from "redux-observable";
import { empty, from, Observable } from "rxjs";
import { catchError, merge, mergeMap } from "rxjs/operators";
import {
  Commit,
  compareRefs,
  loadRefs,
  loadSuggestedRepos
} from "../github/loader";
import { extractJiraKey } from "../jira/key";
import { JiraTicket, loadTickets } from "../jira/loader";
import {
  Action,
  FetchComparisonAction,
  fetchComparisonAction,
  FetchJiraTicketsAction,
  fetchJiraTicketsAction,
  fetchRefsAction,
  SelectRefAction,
  SelectRepoAction,
  updateComparisonAction,
  updateJiraTicketsAction,
  updateRefsAction,
  updateReposAction
} from "./actions";
import { EMPTY_STATE, State } from "./state";

const fetchReposEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
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
              suggested
            })
          ])
        )
      )
    ),
    catchError(error => from([updateReposAction({ status: "failed" })]))
  );
}

const triggerFetchRefsOnRepoSelectEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("SELECT_REPO"),
    mergeMap((action: SelectRepoAction) => {
      return from([fetchRefsAction(action.owner, action.repo)]);
    })
  );

const fetchRefsEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_REFS"),
    mergeMap(() => {
      const currentRepo = state$.value.currentRepo;
      if (!currentRepo) {
        return empty();
      }
      return fetchRefs(currentRepo.owner, currentRepo.repo);
    })
  );

function fetchRefs(owner: string, repo: string): Observable<Action> {
  return from([updateRefsAction({ status: "loading" })]).pipe(
    merge(
      from(loadRefs(owner, repo)).pipe(
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
        !state$.value.currentRepo ||
        state$.value.currentRepo.refs.status !== "loaded" ||
        !state$.value.currentRepo.refs.selectedRefName
      ) {
        return empty();
      }
      const refIndex = state$.value.currentRepo.refs.refs.findIndex(
        r => r.name === action.refName
      );
      if (refIndex === state$.value.currentRepo.refs.refs.length - 1) {
        // Unfortunately we don't have any previous ref to compare to.
        return empty();
      }
      const compareToRefName =
        state$.value.currentRepo.refs.refs[refIndex + 1].name;
      return from([fetchComparisonAction(action.refName, compareToRefName)]);
    })
  );

const fetchCommitsEpic = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
): Observable<Action> =>
  action$.pipe(
    ofType("FETCH_COMPARISON"),
    mergeMap((action: FetchComparisonAction) => {
      const currentRepo = state$.value.currentRepo;
      if (!currentRepo) {
        return empty();
      }
      return fetchComparison(
        currentRepo.owner,
        currentRepo.repo,
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
              result: comparison,
              jiraTickets: EMPTY_STATE
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
  action$: ActionsObservable<Action>,
  state$: StateObservable<State>
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
              jiraTickets
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
  triggerFetchRefsOnRepoSelectEpic,
  fetchRefsEpic,
  triggerFetchCommitsOnRefSelectEpic,
  fetchCommitsEpic,
  fetchJiraTicketsEpic
);
