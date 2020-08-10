import React from "react";
import ReactDOM from "react-dom";
import Home from "./containers/Home";
import Terminal from "./containers/Terminal";
import Recording from "./containers/Recording";
import Session from "./containers/Session/Session";
import Setting from "./containers/Setting";
import { HashRouter, Route } from "react-router-dom";
import { Provider } from "./Context";

window.onload = () => {
  ReactDOM.render(
    <Provider>
      <HashRouter>
        <Route exact path="/" component={Home} />
        <Route exact path="/terminal" component={Terminal} />
        <Route exact path="/session" component={Session} />
        <Route exact path="/recording" component={Recording} />
        <Route exact path="/setting" component={Setting} />
      </HashRouter>
    </Provider>,
    document.getElementById("app")
  );
};
