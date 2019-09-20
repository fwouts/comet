import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import { authenticateGitHub } from "./github/config";
import { GitHubLoaderImpl } from "./github/loader";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import { Router, RouterContext } from "./routing";
import { AppState } from "./store/app";
import "./store/config";

const app = new AppState(new GitHubLoaderImpl(authenticateGitHub()));
app.fetchRepos();
const router = new Router();
router.listen(path => {
  if (path) {
    switch (path.kind) {
      case "repo-only":
        app.selectRepo(path.owner, path.repo);
        break;
      case "repo-and-comparison":
        app.selectRepo(path.owner, path.repo).then(repo => {
          repo.selectRef(path.selectedRefName);
          repo.compareToAnotherRef(path.compareToRefName);
        });
        break;
    }
  }
});

ReactDOM.render(
  <RouterContext.Provider value={router}>
    <App state={app} />
  </RouterContext.Provider>,
  document.getElementById("root")
);
registerServiceWorker();
