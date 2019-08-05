import React from "react";
import ReactDom from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux"; // Let all container components have access to the store without having to pass it explicitly.
import { BrowserRouter as Router } from "react-router-dom";
import store from "./redux/store";
import App from "./App";
import AxiosHandle from "./utils/request";

if (
  // (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
  window.location.protocol === "https:" &&
  navigator.serviceWorker
) {
  window.addEventListener("load", () => {
    const sw = "/service-worker.js";
    navigator.serviceWorker.register(sw);
  });
}

console.log(process.env.NODE_ENV);
function renderWithHotReload(RootElement) {
  ReactDom.render(
    <AppContainer>
      <Provider store={store}>
        <Router>
          <RootElement />
        </Router>
      </Provider>
    </AppContainer>,
    document.getElementById("app")
  );
}

/* initialization */
renderWithHotReload(App);

/* Hot update */
if (module.hot) {
  module.hot.accept("./App", () => {
    // eslint-disable-next-line global-require
    const NextApp = require("./App").default;
    renderWithHotReload(NextApp);
  });
}

AxiosHandle.axiosConfigInit();
