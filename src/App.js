import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";
import HomeScreen from "./pages/HomeScreen";
import LogIn from "./pages/LogIn";
import Register from "./pages/Register";

const routes = [
  {
    path: "/",
    element: <HomeScreen />,
  },
  {
    path: "/log-in",
    element: <LogIn />,
  },
  {
    path: "/register",
    element: <Register />,
  },
];

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
