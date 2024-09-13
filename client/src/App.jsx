import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { BiPlus, BiUser, BiSend, BiSolidUserCircle } from "react-icons/bi";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import { fetchChatResponse } from "../utils/fetchChatResponse";
import ModelSelector from "./components/Model";
// import { handle_ask } from "../utils/chat";

function App() {
  const [text, setText] = useState("");
  const [chatIDs, setChatIDs] = useState([]);
  const [uniqueTitles, setUniqueTitles] = useState([]);
  const [localUniqueTitles, setLocalUniqueTitles] = useState([]);
  const [previousChats, setPreviousChats] = useState([]);
  const [localChats, setLocalChats] = useState([]);
  const [currentChats, setCurrentChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [message, setMessage] = useState(null);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo-16k-0613"); // Default model
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Get the auth token from localStorage and set it to state
    const token = localStorage.getItem("access_token");
    setAuthToken(token);
  }, []);

  const createNewChat = () => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
  };

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };

  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text) return;

    setIsResponseLoading(true);
    setErrorText("");

    try {
      // Call `handle_ask` to get the response from the assistant
      const responseMessage = await handle_ask(text, selectedModel);
      console.log("responseMessage", responseMessage);
      setMessage(responseMessage);
      setText("");

      setTimeout(() => {
        scrollToLastItem.current?.lastElementChild?.scrollIntoView({
          behavior: "smooth",
        });
      }, 1);
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setIsResponseLoading(false);
    }
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsShowSidebar(window.innerWidth <= 640);
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const storedChats = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storedChats[key] = localStorage.getItem(key);
      }
    }
    console.log(storedChats);
    if (storedChats) {
      // setLocalChats(JSON.parse(storedChats));
    }
    // console.log("SC", JSON.parse(storedChats));
    // setCurrentChats((prevChats) => [...prevChats, JSON.parse(storedChats)]);
    // setCurrentChats([]);
    setCurrentChats(Object.values(storedChats));
  }, []);

  useEffect(() => {
    console.log("ENTERED WHEN MESSAGE CHANGED", currentChats);

    if (!currentTitle && text && message) {
      setCurrentTitle(text);
    }

    if (currentTitle && text && message) {
      const newChat = {
        title: currentTitle,
        role: "user",
        content: text,
      };

      const responseMessage = {
        title: currentTitle,
        role: message.role,
        content: message.content,
      };

      setPreviousChats((prevChats) => [...prevChats, newChat, responseMessage]);
      setLocalChats((prevChats) => [...prevChats, newChat, responseMessage]);

      const updatedChats = [...localChats, newChat, responseMessage];
      localStorage.setItem("previousChats", JSON.stringify(updatedChats));
      setCurrentChats(updatedChats); // Updated correctly

      // Calculate unique titles
      const uniqueTitles = Array.from(
        new Set(previousChats.map((prevChat) => prevChat.title))
      );
      setUniqueTitles(uniqueTitles.reverse());

      const localUniqueTitles = Array.from(
        new Set(localChats.map((prevChat) => prevChat.title))
      ).filter((title) => !uniqueTitles.includes(title));

      setLocalUniqueTitles(localUniqueTitles);
    }
  }, [message, currentTitle, text, localChats, previousChats]); // Add `localChats` to the dependency array

  // const currentChat = (localChats || previousChats).filter(
  //   (prevChat) => prevChat.title === currentTitle
  // );

  // const uniqueTitles = Array.from(
  //   new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  // );

  // const localUniqueTitles = Array.from(
  //   new Set(localChats.map((prevChat) => prevChat.title).reverse())
  // ).filter((title) => !uniqueTitles.includes(title));

  // const colorThemes = document.querySelectorAll('[name="theme"]');
  // const message_box = document.getElementById('messages');
  // const message_input = document.getElementById('message-input');
  // const box_conversations = document.querySelector('.box-conversations');
  // const spinner = box_conversations.querySelector('.spinner');
  // const stop_generating = document.querySelector('#stop-generating');
  // const send_button = document.querySelector('#send-button');
  let prompt_lock = false;

  function resizeTextarea(textarea) {
    textarea.style.height = "80px";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }

  const format = (text) => {
    return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
  };

  const delete_conversations = async () => {
    localStorage.clear();
    await new_conversation();
  };

  const handle_ask = async (message, model) => {
    console.log("MSG 1", message);
    if (message === "") {
      throw new Error("Please enter a message");
    }
    return await ask_gpt(message, model); // Ensure ask_gpt is returning the response.
  };

  const remove_cancel_button = async () => {
    // stop_generating.classList.add(`stop_generating-hiding`);
    // setTimeout(() => {
    //     stop_generating.classList.remove(`stop_generating-hiding`);
    //     stop_generating.classList.add(`stop_generating-hidden`);
    // }, 300);
  };

  const ask_gpt = async (message, model) => {
    try {
      if (!message || typeof message !== "string") {
        throw new Error("Invalid message");
      }
      window.conversation_id = uuid();
      // Add the user message to the conversation
      add_conversation(window.conversation_id, message.substr(0, 20));
      window.scrollTo(0, 0);
      window.controller = new AbortController();
      prompt_lock = true; // Disable input while waiting
      window.text = ``;
      window.token = message_id();
      console.log("MSG", message);

      const conversation = await get_conversation(window.conversation_id);
      console.log("CONVO", conversation);

      // Validate conversation data
      if (!Array.isArray(conversation)) {
        throw new Error("Invalid conversation data");
      }

      const response = await fetch(
        "http://127.0.0.1:1338/backend-api/v2/conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            conversation_id: window.conversation_id,
            action: "_ask",
            model: model,
            meta: {
              id: window.token,
              content: {
                conversation,
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
        }
      );

      if (!response.ok) {
        console.log("RES", response);
        throw new Error(`Failed to fetch response: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let chunk;
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

        window.text += chunk;
      }

      // Check for specific error in the response
      if (
        window.text.includes(
          `instead. Maintaining this website and API costs a lot of money`
        )
      ) {
        document.getElementById(`gpt_${window.token}`).innerHTML =
          "An error occurred, please reload / refresh cache and try again.";
      }
      console.log("MESSAGE", message);
      console.log("RESPONSE TEXT", window.text);
      // Add user and assistant messages to the conversation
      add_message(window.conversation_id, "user", message);
      add_message(window.conversation_id, "assistant", window.text);

      await remove_cancel_button();
      prompt_lock = false; // Re-enable input after processing

      await load_conversations(20, 0);

      return window.text;
    } catch (e) {
      console.error("Error in ask_gpt:", e);
      add_message(window.conversation_id, "user", message);

      await remove_cancel_button();
      prompt_lock = false;

      await load_conversations(20, 0);

      throw e; // Rethrow the error to be handled in submitHandler
    }
  };

  const clear_conversations = async () => {
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

  const clear_conversation = async () => {
    // let messages = message_box.getElementsByTagName(`div`);
    // while (messages.length > 0) {
    //     message_box.removeChild(messages[0]);
    // }
  };

  const show_option = async (conversation_id) => {
    const conv = document.getElementById(`conv-${conversation_id}`);
    const yes = document.getElementById(`yes-${conversation_id}`);
    const not = document.getElementById(`not-${conversation_id}`);

    conv.style.display = "none";
    yes.style.display = "block";
    not.style.display = "block";
  };

  const hide_option = async (conversation_id) => {
    const conv = document.getElementById(`conv-${conversation_id}`);
    const yes = document.getElementById(`yes-${conversation_id}`);
    const not = document.getElementById(`not-${conversation_id}`);

    conv.style.display = "block";
    yes.style.display = "none";
    not.style.display = "none";
  };

  const delete_conversation = async (conversation_id) => {
    localStorage.removeItem(`conversation:${conversation_id}`);

    const conversation = document.getElementById(`convo-${conversation_id}`);
    conversation.remove();

    if (window.conversation_id === conversation_id) {
      await new_conversation();
    }

    await load_conversations(20, 0, true);
  };

  const set_conversation = async (conversation_id) => {
    history.pushState({}, null, `/chat/${conversation_id}`);
    window.conversation_id = conversation_id;

    await clear_conversation();
    await load_conversation(conversation_id);
    await load_conversations(20, 0, true);
  };

  const new_conversation = async () => {
    history.pushState({}, null, `/chat/`);
    window.conversation_id = uuid();

    await clear_conversation();
    await load_conversations(20, 0, true);
  };

  const load_conversation = async (conversation_id) => {
    const conversation = await JSON.parse(
      localStorage.getItem(`conversation:${conversation_id}`)
    );
    console.log(conversation, conversation_id);
  };

  const get_conversation = async (conversation_id) => {
    try {
      const conversation = JSON.parse(
        localStorage.getItem(`conversation:${conversation_id}`)
      ) || { items: [] };
      if (!Array.isArray(conversation.items)) {
        throw new Error("Invalid conversation data format");
      }
      return conversation.items.map((item) => ({
        role: item.role || "user",
        content: item.content || "",
      }));
    } catch (error) {
      console.error("Failed to get conversation:", error);
      return [];
    }
  };

  const add_conversation = async (conversation_id, title) => {
    if (localStorage.getItem(`conversation:${conversation_id}`) === null) {
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

  const add_message = async (conversation_id, role, content) => {
    // Retrieve and parse the conversation object from localStorage
    const conversation = localStorage.getItem(
      `conversation:${conversation_id}`
    );
    let before_adding = conversation ? JSON.parse(conversation) : null;

    // If the conversation is not found, initialize it with default values
    if (!before_adding) {
      before_adding = {
        id: conversation_id,
        title: "",
        items: [],
      };
    }

    // Add the new message to the items array
    before_adding.items.push({
      role: role,
      content: content,
    });
    console.log(`before_adding: ${before_adding}`);

    // Store the updated conversation object back in localStorage
    localStorage.setItem(
      `conversation:${conversation_id}`,
      JSON.stringify(before_adding)
    ); // update conversation
  };

  const load_conversations = async (limit, offset, loader) => {
    // console.log(loader);
    // if (loader === undefined) box_conversations.appendChild(spinner);

    const conversations = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).startsWith("conversation:")) {
        const conversation = localStorage.getItem(localStorage.key(i));
        conversations.push(JSON.parse(conversation));
      }
    }

    // if (loader === undefined) spinner.parentNode.removeChild(spinner)
    await clear_conversations();

    // for (const conversation of conversations) {
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
    let hex = str1.toString();
    let str = "";

    for (let n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }

    return str;
  }

  const uuid = () => {
    return `xxxxxxxx-xxxx-4xxx-yxxx-${Date.now().toString(16)}`.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const message_id = () => {
    const random_bytes = (
      Math.floor(Math.random() * 1338377565) + 2956589730
    ).toString(2);
    const unix = Math.floor(Date.now() / 1000).toString(2);

    return BigInt(`0b${unix}${random_bytes}`).toString();
  };

  const register_settings_localstorage = async () => {
    // const settings_ids = ["switch", "model", "jailbreak"];
    // const settings_elements = settings_ids.map((id) => document.getElementById(id));
    // settings_elements.map((element) =>
    //     element.addEventListener(`change`, async (event) => {
    //         switch (event.target.type) {
    //             case "checkbox":
    //                 localStorage.setItem(event.target.id, event.target.checked);
    //                 break;
    //             case "select-one":
    //                 localStorage.setItem(event.target.id, event.target.selectedIndex);
    //                 break;
    //             default:
    //                 console.warn("Unresolved element type");
    //         }
    //     })
    // );
  };

  const load_settings_localstorage = async () => {
    // const settings_ids = ["switch", "model", "jailbreak"];
    // const settings_elements = settings_ids.map((id) => document.getElementById(id));
    // console.log()
    // settings_elements && settings_elements.map((element) => {
    //     if (localStorage.getItem(element.id)) {
    //         switch (element.type) {
    //             case "checkbox":
    //                 element.checked = localStorage.getItem(element.id) === "true";
    //                 break;
    //             case "select-one":
    //                 element.selectedIndex = parseInt(localStorage.getItem(element.id));
    //                 break;
    //             default:
    //                 console.warn("Unresolved element type");
    //         }
    //     }
    // });
  };

  // Theme storage for recurring viewers
  const storeTheme = function (theme) {
    localStorage.setItem("theme", theme);
  };

  // set theme when visitor returns
  const setTheme = function () {
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

  // document.onload = setTheme();
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
  // window.onload = async () => {
  // await load_settings_localstorage();

  // let conversations = 0;
  // for (let i = 0; i < localStorage.length; i++) {
  //     if (localStorage.key(i).startsWith("conversation:")) {
  //         conversations += 1;
  //     }
  // }

  // if (conversations === 0) localStorage.clear();

  // await new Promise(resolve => setTimeout(resolve, 1));
  // await load_conversations(20, 0);

  // if (!window.location.href.endsWith(`#`)) {
  //     if (/\/chat\/.+/.test(window.location.href)) {
  //         await load_conversation(window.conversation_id);
  //     }
  // }

  // // message_input.addEventListener(`keydown`, async (evt) => {
  // //     if (prompt_lock) return;
  // //     if (evt.keyCode === 13 && !evt.shiftKey) {
  // //         evt.preventDefault();
  // //         console.log('pressed enter');
  // //         await handle_ask();
  // //     } else {
  // //         message_input.style.removeProperty("height");
  // //         message_input.style.height = message_input.scrollHeight + 4 + "px";
  // //     }
  // // });

  // // send_button.addEventListener(`click`, async () => {
  // //     console.log("clicked send");
  // //     if (prompt_lock) return;
  // //     await handle_ask();
  // // });

  // await register_settings_localstorage();
  // };

  return (
    <>
      <div className="container">
        <section className={`sidebar ${isShowSidebar ? "open" : ""}`}>
          <div className="sidebar-header" onClick={createNewChat} role="button">
            <BiPlus size={20} />
            <button>New Chat</button>
          </div>
          <div className="sidebar-history">
            {uniqueTitles.length > 0 && previousChats.length !== 0 && (
              <>
                <p>Ongoing</p>
                <ul>
                  {uniqueTitles?.map((uniqueTitle, idx) => {
                    const listItems = document.querySelectorAll("li");

                    listItems.forEach((item) => {
                      if (item.scrollWidth > item.clientWidth) {
                        item.classList.add("li-overflow-shadow");
                      }
                    });

                    return (
                      <li
                        key={idx}
                        onClick={() => backToHistoryPrompt(uniqueTitle)}
                      >
                        {uniqueTitle}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {localUniqueTitles.length > 0 && localChats.length !== 0 && (
              <>
                <p>Previous</p>
                <ul>
                  {localUniqueTitles?.map((uniqueTitle, idx) => {
                    const listItems = document.querySelectorAll("li");

                    listItems.forEach((item) => {
                      if (item.scrollWidth > item.clientWidth) {
                        item.classList.add("li-overflow-shadow");
                      }
                    });

                    return (
                      <li
                        key={idx}
                        onClick={() => backToHistoryPrompt(uniqueTitle)}
                      >
                        {uniqueTitle}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
          <div className="sidebar-info">
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
            <div className="sidebar-info-upgrade">
              {/* <BiUser size={20} /> */}
              <p>Settings</p>
            </div>
            <div className="sidebar-info-user">
              <BiSolidUserCircle size={20} />
              <p>Logout</p>
            </div>
          </div>
        </section>

        <section className="main">
          {!currentTitle && (
            <div className="empty-chat-container">
              <img
                src="images/chatgpt-logo.svg"
                width={45}
                height={45}
                alt="ChatGPT"
              />
              <h1>Developer's ChatGPT</h1>
              <h3>Hello Dev! How can I help you today?</h3>
              <h3>{authToken ? authToken : "No Auth"}</h3>
            </div>
          )}

          {isShowSidebar ? (
            <MdOutlineArrowRight
              className="burger"
              size={28.8}
              onClick={toggleSidebar}
            />
          ) : (
            <MdOutlineArrowLeft
              className="burger"
              size={28.8}
              onClick={toggleSidebar}
            />
          )}
          <div className="main-header">
            <ul>
              {currentChats?.map((chatMsg, idx) => {
                const isUser = chatMsg.role === "user";

                return (
                  <li key={idx} ref={scrollToLastItem}>
                    {isUser ? (
                      <div>
                        <BiSolidUserCircle size={28.8} />
                      </div>
                    ) : (
                      <img src="images/chatgpt-logo.svg" alt="ChatGPT" />
                    )}
                    {isUser ? (
                      <div>
                        <p className="role-title">You</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="role-title">ChatGPT</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="main-bottom">
            {errorText && <p className="errorText">{errorText}</p>}
            {/* {errorText && (
              <p id="errorTextHint">
                *You can clone the repository and use your paid OpenAI API key
                to make this work.
              </p>
            )} */}
            <form className="form-container" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Send a message."
                spellCheck="false"
                value={isResponseLoading ? "Processing..." : text}
                onChange={(e) => setText(e.target.value)}
                readOnly={isResponseLoading}
              />
              {!isResponseLoading && (
                <button
                  type="submit"
                  // onClick={()=>handle_ask(text, selectedModel)}
                >
                  <BiSend size={20} />
                </button>
              )}
            </form>
            <p>
              ChatGPT can make mistakes. Consider checking important
              information.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
