import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ChatBot from "./ChatBot";
import Login from "./Login";
import App from "./App";

// Example of an isLoggedIn check (you can modify this based on your auth logic)
const isLoggedIn = () => {
  return !!localStorage.getItem("access_token"); // Replace with your actual auth check logic
};

const RouteConfig = () => {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route
          path="*"
          element={isLoggedIn() ? <App /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/"
          element={isLoggedIn() ? <App /> : <Navigate to="/login" replace />}
        />

        {/* Protected Chat Routes */}
        <Route
          path="/chat"
          element={
            isLoggedIn() ? <ChatBot /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chat/:conversation_id"
          element={
            isLoggedIn() ? <ChatBot /> : <Navigate to="/login" replace />
          }
        />

        {/* Login and Signup Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default RouteConfig;
