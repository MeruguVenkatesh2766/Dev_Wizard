import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import App from "./App";
import Login from "./components/Login";
import { NavigationProvider } from "./navigationProvider";

// Check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("access_token") !== null;
};

// Wrapper component to handle authentication and redirection
const PrivateRoute = ({ element: Element, ...rest }) => {
  return isAuthenticated() ? <Element {...rest} /> : <Navigate to="/login" />;
};

// Routes configuration
const RouteConfig = () => {
  return (
    <Router>
      <NavigationProvider>
        <Routes>
          {/* Chat Routes (Protected) */}
          <Route path="/chat" element={<PrivateRoute element={App} />} />
          <Route
            path="/chat/:conversation_id"
            element={<PrivateRoute element={App} />}
          />

          {/* Login and Signup Routes (Public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />

          {/* Catch-all route for invalid URLs */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated() ? "/chat" : "/login"} />}
          />
        </Routes>
      </NavigationProvider>
    </Router>
  );
};

export default RouteConfig;
