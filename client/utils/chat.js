
// const colorThemes = document.querySelectorAll('[name="theme"]');
// const message_box = document.getElementById(`messages`);
// const message_input = document.getElementById(`message-input`);
// const box_conversations = document.querySelector(``);
// const spinner = box_conversations.querySelector("");
// const stop_generating = document.querySelector(``);
// const send_button = document.querySelector(``);
let prompt_lock = false;

function resizeTextarea(textarea) {
    textarea.style.height = '80px';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

export const format = (text) => {
    return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
};

export const delete_conversations = async () => {
    localStorage.clear();
    await new_conversation();
};

export const handle_ask = async (message, model) => {
    if (message == '') {
        throw new Error("Please enter a message");
    }
    await ask_gpt(message, model);
};

export const remove_cancel_button = async () => {
    // stop_generating.classList.add(`stop_generating-hiding`);

    // setTimeout(() => {
    //     stop_generating.classList.remove(`stop_generating-hiding`);
    //     stop_generating.classList.add(`stop_generating-hidden`);
    // }, 300);
};

export const ask_gpt = async (message, model) => {
    try {

        add_conversation(window.conversation_id, message.substr(0, 20));
        window.scrollTo(0, 0);
        window.controller = new AbortController();
        add_conversation(window.conversation_id, message.substr(0, 20));
        window.scrollTo(0, 0);
        window.controller = new AbortController();
        prompt_lock = true;
        window.text = ``;
        window.token = message_id()
        console.log("ENTERED INTO ASK_GPT")
        const response = await fetch(`/backend-api/v2/conversation`, {
            method: `POST`,
            signal: window.controller.signal,
            headers: {
                "content-type": `application/json`,
                accept: `text/event-stream`,
            },
            body: JSON.stringify({
                conversation_id: window.conversation_id,
                action: `_ask`,
                model: model,
                meta: {
                    id: window.token,
                    content: {
                        conversation: await get_conversation(window.conversation_id),
                        // internet_access: document.getElementById("switch").checked,
                        content_type: "text",
                        parts: [
                            {
                                content: message,
                                role: "user",
                            },
                        ],
                    },
                },
            }),
        });

        const reader = response.body.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            chunk = new TextDecoder().decode(value);

            if (
                chunk.includes(
                    `<form id="challenge-form" action="/backend-api/v2/conversation?`
                )
            ) {
                chunk = `cloudflare token expired, please refresh the page.`;
            }

            text += chunk;

            // const objects         = chunk.match(/({.+?})/g);

            // try { if (JSON.parse(objects[0]).success === false) throw new Error(JSON.parse(objects[0]).error) } catch (e) {}

            // objects.forEach((object) => {
            //     console.log(object)
            //     try { text += h2a(JSON.parse(object).content) } catch(t) { console.log(t); throw new Error(t)}
            // });

        }

        // if text contains :
        if (
            text.includes(
                `instead. Maintaining this website and API costs a lot of money`
            )
        ) {
            document.getElementById(`gpt_${window.token}`).innerHTML =
                "An error occured, please reload / refresh cache and try again.";
        }

        add_message(window.conversation_id, "user", message);
        add_message(window.conversation_id, "assistant", text);

        await remove_cancel_button();
        prompt_lock = false;

        await load_conversations(20, 0);
    } catch (e) {
        add_message(window.conversation_id, "user", message);

        await remove_cancel_button();
        prompt_lock = false;

        await load_conversations(20, 0);

    }
};

export const clear_conversations = async () => {
    // const elements = box_conversations.childNodes;
    // let index = elements.length;

    // if (index > 0) {
    //     while (index--) {
    //         const element = elements[index];
    //         if (
    //             element.nodeType === Node.ELEMENT_NODE &&
    //             element.tagName.toLowerCase() !== `button`
    //         ) {
    //             box_conversations.removeChild(element);
    //         }
    //     }
    // }
};

export const clear_conversation = async () => {
    // let messages = message_box.getElementsByTagName(`div`);

    // while (messages.length > 0) {
    //     message_box.removeChild(messages[0]);
    // }
};

export const show_option = async (conversation_id) => {
    const conv = document.getElementById(`conv-${conversation_id}`);
    const yes = document.getElementById(`yes-${conversation_id}`);
    const not = document.getElementById(`not-${conversation_id}`);

    conv.style.display = "none";
    yes.style.display = "block";
    not.style.display = "block";
}

export const hide_option = async (conversation_id) => {
    const conv = document.getElementById(`conv-${conversation_id}`);
    const yes = document.getElementById(`yes-${conversation_id}`);
    const not = document.getElementById(`not-${conversation_id}`);

    conv.style.display = "block";
    yes.style.display = "none";
    not.style.display = "none";
}

export const delete_conversation = async (conversation_id) => {
    localStorage.removeItem(`conversation:${conversation_id}`);

    const conversation = document.getElementById(`convo-${conversation_id}`);
    conversation.remove();

    if (window.conversation_id == conversation_id) {
        await new_conversation();
    }

    await load_conversations(20, 0, true);
};

export const set_conversation = async (conversation_id) => {
    history.pushState({}, null, `/chat/${conversation_id}`);
    window.conversation_id = conversation_id;

    await clear_conversation();
    await load_conversation(conversation_id);
    await load_conversations(20, 0, true);
};

export const new_conversation = async () => {
    history.pushState({}, null, `/chat/`);
    window.conversation_id = uuid();

    await clear_conversation();
    await load_conversations(20, 0, true);
};

export const load_conversation = async (conversation_id) => {
    let conversation = await JSON.parse(
        localStorage.getItem(`conversation:${conversation_id}`)
    );
    console.log(conversation, conversation_id);

    // for (item of conversation.items) {
    //     message_box.innerHTML += `
    //         <div class="message">
    //             <div class="user">
    //                 ${item.role == "assistant" ? gpt_image : user_image}
    //                 ${item.role == "assistant"
    //             ? `<i class="fa-regular fa-phone-arrow-down-left"></i>`
    //             : `<i class="fa-regular fa-phone-arrow-up-right"></i>`
    //         }
    //             </div>
    //             <div class="content">
    //                 ${item.content
    //         }
    //             </div>
    //         </div>
    //     `;
    // }

    // message_box.scrollTo({ top: message_box.scrollHeight, behavior: "smooth" });

    // setTimeout(() => {
    //     message_box.scrollTop = message_box.scrollHeight;
    // }, 500);
};

export const get_conversation = async (conversation_id) => {
    let conversation = await JSON.parse(
        localStorage.getItem(`conversation:${conversation_id}`)
    );
    return conversation.items;
};

export const add_conversation = async (conversation_id, title) => {
    if (localStorage.getItem(`conversation:${conversation_id}`) == null) {
        localStorage.setItem(
            `conversation:${conversation_id}`,
            JSON.stringify({
                id: conversation_id,
                title: title,
                items: [],
            })
        );
    }
};

export const add_message = async (conversation_id, role, content) => {
    before_adding = JSON.parse(
        localStorage.getItem(`conversation:${conversation_id}`)
    );

    before_adding.items.push({
        role: role,
        content: content,
    });

    localStorage.setItem(
        `conversation:${conversation_id}`,
        JSON.stringify(before_adding)
    ); // update conversation
};

export const load_conversations = async (limit, offset, loader) => {
    //console.log(loader);
    //if (loader === undefined) box_conversations.appendChild(spinner);

    let conversations = [];
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("conversation:")) {
            let conversation = localStorage.getItem(localStorage.key(i));
            conversations.push(JSON.parse(conversation));
        }
    }

    //if (loader === undefined) spinner.parentNode.removeChild(spinner)
    await clear_conversations();

    // for (conversation of conversations) {
    //     box_conversations.innerHTML += `
    // <div class="convo" id="convo-${conversation.id}">
    //   <div class="left" onclick="set_conversation('${conversation.id}')">
    //       <i class="fa-regular fa-comments"></i>
    //       <span class="convo-title">${conversation.title}</span>
    //   </div>
    //   <i onclick="show_option('${conversation.id}')" class="fa-regular fa-trash" id="conv-${conversation.id}"></i>
    //   <i onclick="delete_conversation('${conversation.id}')" class="fa-regular fa-check" id="yes-${conversation.id}" style="display:none;"></i>
    //   <i onclick="hide_option('${conversation.id}')" class="fa-regular fa-x" id="not-${conversation.id}" style="display:none;"></i>
    // </div>
    // `;
    // }
};

// document.getElementById(`cancelButton`).addEventListener(`click`, async () => {
//     window.controller.abort();
//     console.log(`aborted ${window.conversation_id}`);
// });

function h2a(str1) {
    var hex = str1.toString();
    var str = "";

    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }

    return str;
}

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

export const message_id = () => {
    random_bytes = (Math.floor(Math.random() * 1338377565) + 2956589730).toString(
        2
    );
    unix = Math.floor(Date.now() / 1000).toString(2);

    return BigInt(`0b${unix}${random_bytes}`).toString();
};


export const register_settings_localstorage = async () => {
    settings_ids = ["switch", "model", "jailbreak"];
    settings_elements = settings_ids.map((id) => document.getElementById(id));
    settings_elements.map((element) =>
        element.addEventListener(`change`, async (event) => {
            switch (event.target.type) {
                case "checkbox":
                    localStorage.setItem(event.target.id, event.target.checked);
                    break;
                case "select-one":
                    localStorage.setItem(event.target.id, event.target.selectedIndex);
                    break;
                default:
                    console.warn("Unresolved element type");
            }
        })
    );
};

export const load_settings_localstorage = async () => {
    let settings_ids = ["switch", "model", "jailbreak"];
    let settings_elements = settings_ids.map((id) => document.getElementById(id));
    settings_elements.map((element) => {
        if (localStorage.getItem(element.id)) {
            switch (element.type) {
                case "checkbox":
                    element.checked = localStorage.getItem(element.id) === "true";
                    break;
                case "select-one":
                    element.selectedIndex = parseInt(localStorage.getItem(element.id));
                    break;
                default:
                    console.warn("Unresolved element type");
            }
        }
    });
};

// Theme storage for recurring viewers
export const storeTheme = function (theme) {
    localStorage.setItem("theme", theme);
};

// set theme when visitor returns
export const setTheme = function () {
    const activeTheme = localStorage.getItem("theme");
    // colorThemes.forEach((themeOption) => {
    //     if (themeOption.id === activeTheme) {
    //         themeOption.checked = true;
    //     }
    // });
    // fallback for no :has() support
    document.documentElement.className = activeTheme;
};

// colorThemes.forEach((themeOption) => {
//     themeOption.addEventListener("click", () => {
//         storeTheme(themeOption.id);
//         // fallback for no :has() support
//         document.documentElement.className = themeOption.id;
//     });
// });

document.onload = setTheme();
// document.querySelector(".mobile-sidebar").addEventListener("click", (event) => {
//     const sidebar = document.querySelector(".conversations");

//     if (sidebar.classList.contains("shown")) {
//         sidebar.classList.remove("shown");
//         event.target.classList.remove("rotated");
//     } else {
//         sidebar.classList.add("shown");
//         event.target.classList.add("rotated");
//     }

//     window.scrollTo(0, 0);
// });
window.onload = async () => {
    load_settings_localstorage();

    let conversations = 0;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("conversation:")) {
            conversations += 1;
        }
    }

    if (conversations == 0) localStorage.clear();

    await setTimeout(() => {
        load_conversations(20, 0);
    }, 1);

    if (!window.location.href.endsWith(`#`)) {
        if (/\/chat\/.+/.test(window.location.href)) {
            await load_conversation(window.conversation_id);
        }
    }

    // message_input.addEventListener(`keydown`, async (evt) => {
    //     if (prompt_lock) return;
    //     if (evt.keyCode === 13 && !evt.shiftKey) {
    //         evt.preventDefault();
    //         console.log('pressed enter');
    //         await handle_ask();
    //     } else {
    //         message_input.style.removeProperty("height");
    //         message_input.style.height = message_input.scrollHeight + 4 + "px";
    //     }
    // });

    // send_button.addEventListener(`click`, async () => {
    //     console.log("clicked send");
    //     if (prompt_lock) return;
    //     await handle_ask();
    // });

    register_settings_localstorage();
};
