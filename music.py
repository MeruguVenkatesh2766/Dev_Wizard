import yt_dlp

def download_audio(url):
    try:
        ydl_opts = {
            'format': 'bestaudio/best',  # Get the best audio quality
            'outtmpl': './downloads/%(title)s.%(ext)s',  # Save the file in the 'downloads' folder with title as the filename
            'postprocessors': [{
                'key': 'FFmpegAudioConvertor',  # Convert to desired audio format (e.g., MP3)
                'preferredcodec': 'mp3',  # Convert to MP3
                'preferredquality': '192',  # Set quality to 192kbps
            }],
            'noplaylist': True,  # Only download the single video (not a playlist)
            'quiet': False,  # Show download progress
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            print(f"Audio has been downloaded and saved.")

    except Exception as e:
        print(f"Error: {e}")

# Example usage
download_audio("https://www.youtube.com/watch?v=aQUP5dKfu_Q")


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

      // Make API call with formatted history and get response stream
      const eventSource = await fetchChatResponse(
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

      // Handle incoming streamed responses
      eventSource.onmessage = function (event) {
        const response = event.data;
        console.log("Received response: ", response);

        // Add assistant's response to the chat history
        const assistantMessage = { role: "assistant", content: response };

        setChatHistory((prev) => [
          ...prev,
          {
            ...defaultData,
            conversation: [...defaultData.conversation, assistantMessage],
          },
        ]);

        // Scroll to bottom after receiving the response
        setTimeout(() => {
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      };

      eventSource.onerror = function (error) {
        setErrorText("Error receiving stream data.");
        console.error("Error receiving stream data:", error);
        eventSource.close(); // Close the stream if there's an error
      };
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsResponseLoading(false);
    }
  };