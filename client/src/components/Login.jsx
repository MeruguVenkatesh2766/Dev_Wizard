import React, { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let endpoint = window.location.href.includes("signup") ? "signup" : "login";

    try {
      const response = await fetch(`http://127.0.0.1:1338/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "/chat"; // Redirect to another page on successful login
      } else {
        setError(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-header">
          {window.location.href.includes("login") ? "Sign in" : "Sign up"} to
          Dev Wizard
        </h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="login-label">
            Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
        {!window.location.href.includes("signup") ? (
          <p className="login-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        ) : (
          <p className="login-footer">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
