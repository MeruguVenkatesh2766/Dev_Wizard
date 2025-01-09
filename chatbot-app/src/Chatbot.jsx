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
import CustomDrawer from "./customDrawer";

const drawerWidth = 240;

const ChatBot = ({ defaultData }) => {
  const { data, drawerOpen, handleDrawerToggle } = defaultData;
  console.log("DATABASE", data);

  const { models, chatsData } = data;
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0] || {});
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || "");
  const [selectedModelCapability, setSelectedModelCapability] = useState("");
  const [selectedModelSource, setSelectedModelSource] = useState(
    models[0]?.source || ""
  );
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: "English",
  });

  const [chatId, setChatId] = useState("");
  const [currentChat, setCurrentChat] = useState(
    chatsData ? chatsData[chatsData.length - 1] : null
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [clearHistory, setClearHistory] = useState(true);
  const [responseTypeNeeded, setResponseTypeNeeded] = useState("text-based");
  // const [responseTypeNeeded, setResponseTypeNeeded] = useState(
  //   models[0]?.capabilities[0]
  // );
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);

  // Sample chat history data
  const chatsHistory = [
    { id: 1, title: "Previous Chat 1", date: "2025-01-02" },
    { id: 2, title: "Previous Chat 2", date: "2025-01-01" },
    { id: 3, title: "Previous Chat 3", date: "2024-12-31" },
  ];

  const handleModelChange = (event) => {
    setSelectedModelId(event.target.value);
    models.forEach((model) => {
      if (model.id == event.target.value) setSelectedModel(model);
      if (model.source !== selectedModelSource)
        setSelectedModelSource(model.source);
    });
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
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
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setIsResponseLoading(true);
    setErrorText("");

    const newMessage = {
      role:
        selectedModelSource.toLowerCase() === "chatgpt" ? "developer" : "user",
      content: input,
    };
    // Add the new message to chat history
    let defaultData = {
      chat_id: chatId,
      created_at: createDateAndTime(),
      conversation: [newMessage],
      model_source: selectedModelSource,
      model: selectedModel,
      selected_capability: selectedModelCapability,
    };

    try {
      // Add user message to current chat history
      setChatHistory((prev) => [...prev, defaultData]);
      setInput("");

      // Format the chat history based on model source
      const formattedHistory = formatChatHistoryForModel(
        [...chatHistory, newMessage],
        selectedModelSource
      );

      console.log("Formatted history:", formattedHistory);

      // Make API call with formatted history
      const response = await fetchChatResponse(
        apiKey,
        selectedModel.id,
        selectedModel.name,
        selectedModel.source,
        selectedModel.capabilities,
        formattedHistory,
        input,
        clearHistory,
        responseTypeNeeded
      );

      // Add the response to chat history
      const assistantMessage = { role: "assistant", content: response };
      defaultData = setChatHistory((prev) => [
        ...prev,
        defaultData["conversation"].push(assistantMessage),
      ]);

      // Save to localStorage if needed
      addMessageToChat(conversationId, newMessage.role, input);
      addMessageToChat(conversationId, "assistant", response);

      // Scroll to bottom
      setTimeout(() => {
        scrollToLastItem.current?.lastElementChild?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsResponseLoading(false);
    }
  };
  useEffect(() => {
    setChatId(uuid());
  }, [selectedModelSource]);
  console.log("SM", selectedModel);

  return (
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
        <Box sx={{ overflow: "auto", minHeight: "65vh", maxHeight: "65vh" }}>
          {chatHistory.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection:
                  msg.sender === "assistant" ? "row" : "row-reverse",
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor:
                    msg.sender === "assistant" ? "#f0f0f0" : "#6200ea",
                  color: msg.sender === "assistant" ? "black" : "white",
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
  );
};

export default ChatBot;
