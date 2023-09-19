import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import LogIn from "./pages/LogIn";
import Register from "./pages/Register";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <LogIn /> */}
    <Register />
  </React.StrictMode>
);
