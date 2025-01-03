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

// Available models data
const availableModels = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5", name: "GPT-3.5" },
  { id: "claude-3", name: "Claude 3" },
  { id: "claude-2", name: "Claude 2" },
];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
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
  };

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
      ]);
      setInput("");
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `Response from ${
              availableModels.find((m) => m.id === selectedModel).name
            }`,
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

      <List>
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
      </List>
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
    <Box sx={{ display: "flex" }}>
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

      <Box sx={{ flexGrow: 1 }}>
        <Container
          maxWidth="xs"
          style={{ minHeight: "100vh", margin: 0, minWidth: "100%" }}
        >
          <Paper sx={{ flex: 1, padding: 2 }}>
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
                  Chatbot <FaRegComments />
                </Typography>
              </Box>

              {/* Model Selector */}
              <FormControl sx={{ minWidth: 120 }} size="small">
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
                  {availableModels.map((model) => (
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
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ overflow: "auto" }}>
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

          <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
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
        </Container>
      </Box>
    </Box>
  );
};

export default Chatbot;
