// Helper function to format chat history based on model source
export const formatChatHistoryForModel = (history, modelSource) => {
    console.log("formatChatHistoryForModel", modelSource, history)
    console.log("formatChatHistoryForIISTORY", history)
    switch (modelSource.toLowerCase()) {
        case 'chatgpt':
            return history.map(msg => ({
                role: 'developer',
                content: msg.content
            }));

        case 'qwen':
            // Convert to Qwen's format: [[user_msg, assistant_msg], ...]
            const qwenHistory = [];
            for (let i = 0; i < history.length; i += 2) {
                if (i + 1 < history.length) {
                    // If there's a pair (user + assistant)
                    qwenHistory.push([history[i].content, history[i + 1].content]);
                } else {
                    // If there's a single user message without a response
                    qwenHistory.push([history[i].content, ""]);
                }
            }
            return qwenHistory;


        default:
            return history;
    }
};