import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import { createEpicMiddleware } from "redux-observable";
import App from "./App";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import { Action } from "./store/actions";
import { rootEpic } from "./store/epics";
import { rootReducer } from "./store/reducer";
import { State } from "./store/state";

const devToolsExtension = (window as any).devToolsExtension;

const epicMiddleware = createEpicMiddleware<Action, Action, State>();
const store = createStore(
  rootReducer,
  devToolsExtension
    ? compose(
        applyMiddleware(epicMiddleware),
        devToolsExtension()
      )
    : applyMiddleware(epicMiddleware)
);
epicMiddleware.run(rootEpic);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
