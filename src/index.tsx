import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory, Location } from "history";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import { createEpicMiddleware } from "redux-observable";
import App from "./components/App";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import { parsePath } from "./routing";
import { Action, updateSelectedRepoAction } from "./store/actions";
import { rootEpic } from "./store/epics";
import { rootReducer } from "./store/reducer";
import { State } from "./store/state";

const devToolsExtension = (window as any).devToolsExtension;

const epicMiddleware = createEpicMiddleware<Action, Action, State>();
const history = createBrowserHistory();
const storeEnhancer = applyMiddleware(
  routerMiddleware(history),
  epicMiddleware
);
const store = createStore(
  connectRouter(history)(rootReducer),
  devToolsExtension
    ? compose(
        storeEnhancer,
        devToolsExtension()
      )
    : storeEnhancer
);
epicMiddleware.run(rootEpic);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();

const locationListener = (location: Location) => {
  const path = parsePath(location.pathname);
  if (path) {
    store.dispatch(updateSelectedRepoAction(path.owner, path.repo));
  }
};
history.listen(location => {
  const path = parsePath(location.pathname);
  if (path) {
    store.dispatch(updateSelectedRepoAction(path.owner, path.repo));
  }
});
locationListener(history.location);
