// src/App.jsx
import React, { useState, useEffect } from "react";
import Chatbot from "./ChatBot";
import { CircularProgress, Box, Alert } from "@mui/material";
import { API_URL } from "../config";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    models: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.all([
          fetch(`${API_URL}/models`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch models");
            return res.json();
          }),
          // Add other API endpoints here when needed
        ]);

        const [modelsData] = results;

        // Transform the models data to match the format needed by Chatbot
        const transformedModels = modelsData.flatMap((source) =>
          source.children_models.map((model) => ({
            id: model.model_id,
            name: model.model_name,
            capabilities: model.model_capabilities,
            endpoint: model.model_endpoint,
            source: source.source_name,
          }))
        );

        setData({
          models: transformedModels,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Error loading application data: {error}</Alert>
      </Box>
    );
  }

  return <Chatbot models={data.models} />;
};

export default App;
