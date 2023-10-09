import React from "react";
import ReactDOM from "react-dom";
import { RouterProvider } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { init as initShared } from "@namada/shared/src/init";
import "./index.css";
import { store } from "store/store";
import { getRouter } from "./App/AppRoutes";
import { ExtensionEventsProvider } from "services";
import { Provider } from "react-redux";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ExtensionEventsProvider>
        <RouterProvider router={getRouter()} />
      </ExtensionEventsProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
initShared();
