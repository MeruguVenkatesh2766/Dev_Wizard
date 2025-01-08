export const uuid = () => {
    return `xxxxxxxx-xxxx-4xxx-yxxx-${Date.now().toString(16)}`.replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
};

export const messageId = () => {
    const randomBytes = (Math.floor(Math.random() * 1338377565) + 2956589730).toString(2);
    const unix = Math.floor(Date.now() / 1000).toString(2);
    return BigInt(`0b${unix}${randomBytes}`).toString();
};

export const getChatFromStorage = (conversationId) => {
    return JSON.parse(localStorage.getItem(`conversation:${conversationId}`));
};

export const saveChatToStorage = (conversationId, chatData) => {
    localStorage.setItem(`conversation:${conversationId}`, JSON.stringify(chatData));
};

export const addMessageToChat = (conversationId, role, content) => {
    const currentChat = getChatFromStorage(conversationId);
    if (currentChat) {
        currentChat.items.push({ role, content });
        saveChatToStorage(conversationId, currentChat);
    }
};

export const initializeChat = (conversationId, title) => {
    if (!localStorage.getItem(`conversation:${conversationId}`)) {
        saveChatToStorage(conversationId, {
            id: conversationId,
            title,
            items: []
        });
    }
};

export const getAllChats = () => {
    const chats = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("conversation:")) {
            chats.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    return chats;
};

export const deleteChat = (conversationId) => {
    localStorage.removeItem(`conversation:${conversationId}`);
};

export const clearAllChats = () => {
    localStorage.clear();
};

export const createDateAndTime = () => {
    const date = new Date();

    // Extract components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Combine into ISO 8601 format with 6 digits of precision for milliseconds
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}000`;

    return formattedDate;
}
