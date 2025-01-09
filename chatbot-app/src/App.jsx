// src/App.jsx
import React, { useState, useEffect } from "react";
import Chatbot from "./ChatBot";
import { CircularProgress, Box, Alert } from "@mui/material";
import { API_URL } from "../config";
import { Typography } from "@mui/material";
import { FaRegComments, FaBars } from "react-icons/fa";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    models: [],
    chats: [],
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.all([
          fetch(`${API_URL}/models`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch models");
            return res.json();
          }),
          fetch(`${API_URL}/chats`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch models");
            return res.json();
          }),
          // Add other API endpoints here when needed
        ]);

        const [modelsData, chatsData] = results;

        // Transform the models data to match the format needed by Chatbot
        const transformedModels = modelsData.flatMap((source) =>
          source.children_models.map((model) => ({
            id: model.model_id,
            name: model.model_name,
            has_api_key: model.model_api_key,
            capabilities: model.model_capabilities,
            source: source.source_name,
          }))
        );

        setData({
          models: transformedModels,
          chats: chatsData,
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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightyellow",
      }}
    >
      <CustomDrawer
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
        chatsHistory={chatsHistory}
        settings={settings}
        handleLogout={handleLogout}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "lightyellow",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            onClick={handleDrawerToggle}
            sx={{
              cursor: "pointer",
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaBars size={24} />
          </Box>
          <Typography variant="h6">
            ChatBot <FaRegComments />
          </Typography>
        </Box>
        <Chatbot
          defaultData={{
            data: data,
            drawerOpen: drawerOpen,
            handleDrawerToggle: handleDrawerToggle,
          }}
        />
      </Box>
    </Box>
  );
};

export default App;
