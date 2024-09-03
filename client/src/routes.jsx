import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Login from "./components/Login";

const RouteConfig = () => {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        {/* <Route path="/" element={<Home />} /> */}

        {/* Chat Routes */}
        <Route path="/chat" element={<App />} />
        <Route path="/chat/:conversation_id" element={<App />} />

        {/* Assets Route */}
        {/* <Route path="/assets/:folder/:file" element={<Assets />} /> */}

        {/* Login and Signup Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default RouteConfig;
