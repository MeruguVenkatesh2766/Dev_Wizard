// Define default patterns for different model sources
export const ModelPatterns = {
    chatgpt: {
        defaultHistory: [],
        messageFormat: {
            role: 'developer',  // or 'assistant'
            content: ''
        },
        responseFormat: {
            choices: [{
                message: '',
                index: 0
            }]
        }
    },
    qwen: {
        defaultHistory: [],
        messageFormat: {
            role: 'user',  // or 'assistant'
            content: ''
        },
        responseFormat: {
            response: [
                '',
                [['user_message', 'assistant_response']],
                'system_message'
            ],
            timestamp: '',
            model_source: 'qwen'
        }
    },
    gemini: {
        defaultHistory: [],
        messageFormat: {
            role: 'user',  // or 'assistant'
            content: {
                type: 'text',  // or 'file' or 'component'
                content: ''
            }
        },
        responseFormat: {
            response: {
                type: 'text',
                content: ''
            }
        }
    },
    llama: {
        defaultHistory: [],
        messageFormat: {
            role: 'user',  // or 'assistant'
            content: ''
        },
        responseFormat: {
            message: '',
            status: 'success'
        }
    }
};

// Format chat history based on model patterns
export const formatChatHistoryForModel = (history, modelSource) => {
    const pattern = ModelPatterns[modelSource.toUpperCase()];
    if (!pattern) return history; // Return unchanged if no pattern found

    switch (modelSource.toLowerCase()) {
        case 'chatgpt':
            return history.map(msg => ({
                ...pattern.messageFormat,
                role: msg.role === 'user' ? 'developer' : 'assistant',
                content: msg.content
            }));

        case 'qwen':
            const pairs = [];
            for (let i = 0; i < history.length; i += 2) {
                if (i + 1 < history.length) {
                    pairs.push([history[i].content, history[i + 1].content]);
                }
            }
            return pairs;

        case 'gemini':
            return history.map(msg => ({
                ...pattern.messageFormat,
                role: msg.role,
                content: {
                    type: 'text',
                    content: msg.content
                }
            }));

        case 'llama':
            return history.map(msg => ({
                ...pattern.messageFormat,
                role: msg.role,
                content: msg.content
            }));

        default:
            return history;
    }
};

// Format request payload based on model patterns
export const formatRequestPayload = (params) => {
    const { apiKey, model, chatHistory, prompt } = params;
    const pattern = ModelPatterns[model.source.toUpperCase()];

    if (!pattern) {
        throw new Error(`Unsupported model source: ${model.source}`);
    }

    return {
        ...pattern.requestFormat,
        api_key: apiKey,
        model_id: model.id,
        model_name: model.name,
        model_source: model.source,
        model_capabilities: model.capabilities,
        chat_history: formatChatHistoryForModel(chatHistory, model.source),
        prompt
    };
};

// Parse response based on model patterns
export const parseModelResponse = (response, modelSource) => {
    const pattern = ModelPatterns[modelSource.toUpperCase()];
    if (!pattern) return response;

    switch (modelSource.toLowerCase()) {
        case 'chatgpt':
            return response.choices[0].message;

        case 'qwen':
            return response.response[1][0][1]; // Get assistant's response from the pair

        case 'geminiai':
            return response.response.content;

        case 'llama':
            return response.message;

        default:
            return response;
    }
};