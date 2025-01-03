import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Link,
} from "@mui/material";
import { API_URL } from "../config";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${
          window.location.href.includes("signup") ? "signup" : "login"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "/";
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={3}
      bgcolor="#f5f5f5"
    >
      <Typography variant="h4" gutterBottom>
        {window.location.href.includes("login") ? "Sign In" : "Sign Up"} to Dev
        Wizard
      </Typography>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400 }}>
        {window.location.href.includes("signup") && (
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Box marginTop={2} display="flex" justifyContent="center">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : window.location.href.includes("login") ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </Button>
        </Box>
        {error && (
          <Typography color="error" align="center" marginTop={2}>
            {error}
          </Typography>
        )}
      </form>

      <Box marginTop={2}>
        {!window.location.href.includes("signup") ? (
          <Typography variant="body2">
            Don't have an account?{" "}
            <Link href="/signup" underline="hover">
              Sign up
            </Link>
          </Typography>
        ) : (
          <Typography variant="body2">
            Already have an account?{" "}
            <Link href="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;
