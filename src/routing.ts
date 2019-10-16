import { createBrowserHistory, History, Location } from "history";
import React from "react";

export const RouterContext = React.createContext<Router>(null!);

export class Router {
  private readonly history: History;

  private listener?: (path: ParsedPath) => void;

  constructor() {
    this.history = createBrowserHistory();
    this.history.listen((location: Location) => {
      this.onLocationUpdated(location);
    });
  }

  navigate(
    owner: string,
    repo: string,
    selectedRefName?: string,
    compareToRefName?: string
  ) {
    const path = producePath(owner, repo, selectedRefName, compareToRefName);
    this.history.push(path);
  }

  listen(listener: (path: ParsedPath) => void) {
    this.listener = listener;
    this.onLocationUpdated(this.history.location);
  }

  private onLocationUpdated(location: Location) {
    if (!this.listener) {
      return;
    }
    this.listener(parsePath(this.history.location.pathname));
  }
}

function producePath(
  owner: string,
  repo: string,
  selectedRefName?: string,
  compareToRefName?: string
) {
  let path = `/${owner}/${repo}`;
  if (selectedRefName && compareToRefName) {
    path += `/${selectedRefName}:${compareToRefName}`;
  }
  return path;
}

function parsePath(path: string): ParsedPath {
  const [, owner, repo, ...rest] = path.split("/");
  if (!owner || !repo) {
    return null;
  }
  const refs = rest.join("/").split(":");
  if (refs.length === 2) {
    return {
      kind: "repo-and-comparison",
      owner,
      repo,
      selectedRefName: refs[0],
      compareToRefName: refs[1]
    };
  }
  return {
    kind: "repo-only",
    owner,
    repo
  };
}

export type ParsedPath =
  | {
      kind: "repo-only";
      owner: string;
      repo: string;
    }
  | {
      kind: "repo-and-comparison";
      owner: string;
      repo: string;
      selectedRefName: string;
      compareToRefName: string;
    }
  | null;
