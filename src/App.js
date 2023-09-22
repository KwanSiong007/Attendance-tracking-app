import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LogIn from "./pages/LogIn";
import ManagerScreen from "./pages/ManagerScreen";
import WorkerScreen from "./pages/WorkerScreen";
import Register from "./pages/Register";

const routes = [
  {
    path: "/",
    element: <LogIn />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/manager-screen",
    element: <ManagerScreen />,
  },
  {
    path: "/worker-screen",
    element: <WorkerScreen />,
  },
];

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {routes.map((route) => (
            <Route path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
