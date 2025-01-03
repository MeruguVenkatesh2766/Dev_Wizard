import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  FaRegComments,
  FaBars,
  FaHistory,
  FaUser,
  FaMoon,
  FaBell,
  FaChevronLeft,
  FaUserCog,
  FaLanguage,
  FaSignOutAlt,
  FaRobot,
} from "react-icons/fa";

const drawerWidth = 240;

const ChatBot = ({ models }) => {
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || "");
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: "English",
  });

  // Sample chat history data
  const chatHistory = [
    { id: 1, title: "Previous Chat 1", date: "2025-01-02" },
    { id: 2, title: "Previous Chat 2", date: "2025-01-01" },
    { id: 3, title: "Previous Chat 3", date: "2024-12-31" },
  ];

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.setItem("access_token", "");
    window.location.href = "/login";
  };

  // Update the message response to use the actual model name
  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
      ]);
      setInput("");
      setTimeout(() => {
        const selectedModelData = models.find((m) => m.id === selectedModel);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `Response from ${selectedModelData.name}`,
            sender: "bot",
          },
        ]);
      }, 1000);
    }
  };

  const drawer = (
    <Box
      sx={{
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
    >
      {/* Previous drawer content remains the same */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FaUser style={{ marginRight: "8px" }} />
          <Typography variant="h6">User Profile</Typography>
        </Box>
        <FaChevronLeft
          style={{ cursor: "pointer" }}
          onClick={handleDrawerToggle}
        />
      </Box>
      <Divider />

      {/* <List>
        <ListItem>
          <ListItemIcon>
            <FaMoon />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch
            checked={settings.darkMode}
            onChange={() => handleSettingChange("darkMode")}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <FaBell />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
          <Switch
            checked={settings.notifications}
            onChange={() => handleSettingChange("notifications")}
          />
        </ListItem>
      </List> */}
      <Divider />

      <Typography variant="h6" sx={{ p: 2 }}>
        Chat History
      </Typography>
      <List sx={{ flex: 1, overflow: "auto" }}>
        {chatHistory.map((chat) => (
          <ListItem button key={chat.id}>
            <ListItemIcon>
              <FaHistory />
            </ListItemIcon>
            <ListItemText primary={chat.title} secondary={chat.date} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon>
              <FaUserCog />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <FaLanguage />
            </ListItemIcon>
            <ListItemText primary="Language" secondary={settings.language} />
          </ListItem>
          <ListItem button onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <FaSignOutAlt style={{ color: "#d32f2f" }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightyellow",
      }}
    >
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Container
        maxWidth="xs"
        style={{
          flexGrow: 1,
          minHeight: "100vh",
          margin: 0,
          minWidth: "80%",
          maxWidth: "80%",
          gap: "10px",
        }}
      >
        <Paper sx={{ flex: 1, padding: 2, margin: "10px 0" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "space-between",
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

            {/* Model Selector */}
            <FormControl size="small">
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <TextField
                  sx={{ minWidth: "350px" }}
                  label="Type your api-key here"
                  variant="outlined"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                />
                <Select
                  value={selectedModel}
                  onChange={handleModelChange}
                  displayEmpty
                  sx={{
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  {models.map((model) => (
                    <MenuItem
                      key={model.id}
                      value={model.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <FaRobot />
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {model.source}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </FormControl>
          </Box>

          <Box sx={{ overflow: "auto", minHeight: "65vh", maxHeight: "65vh" }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: msg.sender === "bot" ? "row" : "row-reverse",
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    padding: 1,
                    backgroundColor:
                      msg.sender === "bot" ? "#f0f0f0" : "#6200ea",
                    color: msg.sender === "bot" ? "black" : "white",
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, padding: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              label="Type a message"
              variant="outlined"
              fullWidth
              value={input}
              onChange={handleInputChange}
              sx={{ mr: 1 }}
            />
            <Button variant="contained" onClick={handleSendMessage}>
              Send
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChatBot;
