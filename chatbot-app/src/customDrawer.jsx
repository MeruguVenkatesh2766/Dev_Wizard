import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
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
import { fetchChatResponse } from "../utils/fetchChatResponse";
import { formatChatHistoryForModel } from "../utils/chatHistoryManager";
import { addMessageToChat, uuid, createDateAndTime } from "../utils/helper";

const drawerWidth = 240;

const CustomDrawer = ({
  drawerOpen,
  handleDrawerToggle,
  chatsHistory,
  settings,
  handleLogout,
}) => {
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

      <Typography variant="h6" sx={{ p: 2, paddingBottom: 0 }}>
        New Chat
      </Typography>
      <Typography variant="h6" sx={{ p: 2 }}>
        Chat History
      </Typography>
      <List sx={{ flex: 1, overflow: "auto" }}>
        {chatsHistory.map((chat) => (
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
  );
};

export default CustomDrawer;
