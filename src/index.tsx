import {
  ConnectedRouter,
  connectRouter,
  routerMiddleware
} from "connected-react-router";
import { createBrowserHistory } from "history";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router";
import { applyMiddleware, compose, createStore } from "redux";
import { createEpicMiddleware } from "redux-observable";
import App from "./components/App";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import { parsePath } from "./routing";
import { Action } from "./store/actions";
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
    <ConnectedRouter history={history}>
      <Switch>
        <Route
          render={props => <App path={parsePath(props.location.pathname)} />}
        />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
