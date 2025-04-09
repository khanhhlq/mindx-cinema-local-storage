export var TMDB_API_KEY = "9b7c3ede447b14c5e0e9d33a137ddac9";

// Scroll event listener for navbar background
window.addEventListener("scroll", function() {
  var navbar = document.querySelector(".navbar");
  if (window.scrollY === 0) {
    navbar.classList.remove("navbar-background-visible");
  } else {
    navbar.classList.add("navbar-background-visible");
  }
});

// User authentication functions
window.handleSignOut = function() {
  localStorage.removeItem("currentUser");
  window.location.reload();
};

window.signIn = function() {};

// User status check and UI update
var avatarContainer = document.querySelector("#avatar-action-container");
if (localStorage.getItem("currentUser")) {
  try {
    var userData = JSON.parse(localStorage.getItem("currentUser"));
    var username = userData.username ? encodeURIComponent(userData.username) : '';
    
    avatarContainer.innerHTML += 
      '<div tabindex="0" class="avatar-action">' +
        '<img src="https://api.dicebear.com/7.x/initials/svg?seed=' + username + '" alt="User avatar">' +
        '<div class="popup">' +
          '<button class="action-button" onclick="handleSignOut()">' +
            '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>' +
            '<span> Logout</span>' +
          '</button>' +
        '</div>' +
      '</div>';
  } catch (e) {
    console.error("Error parsing user data:", e);
    avatarContainer.innerHTML += 
      '<a style="font-size: 25px" href="./login.html">' +
        '<i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i>' +
      '</a>';
  }
} else {
  avatarContainer.innerHTML += 
    '<a style="font-size: 25px" href="./login.html">' +
      '<i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i>' +
    '</a>';
}

// Chatbot implementation
var chatbotMarkup = 
  '<button class="chatbot-toggler" aria-label="Toggle chatbot">' +
    '<span class="material-symbols-rounded" aria-hidden="true">mode_comment</span>' +
    '<span class="material-symbols-outlined" aria-hidden="true">close</span>' +
  '</button>' +
  '<div class="chatbot" role="dialog" aria-label="Chatbot">' +
    '<header>' +
      '<h2>Chatbot</h2>' +
      '<button class="close-btn material-symbols-outlined" aria-label="Close chatbot">close</button>' +
    '</header>' +
    '<ul class="chatbox" aria-live="polite">' +
      '<li class="chat incoming">' +
        '<span class="material-symbols-outlined" aria-hidden="true">smart_toy</span>' +
        '<p>Hi there 👋<br>How can I help you today?</p>' +
      '</li>' +
    '</ul>' +
    '<div class="chat-input">' +
      '<textarea placeholder="Enter a message..." spellcheck="false" required aria-label="Chat input"></textarea>' +
      '<button id="send-btn" class="material-symbols-rounded" aria-label="Send message">send</button>' +
    '</div>' +
  '</div>';

document.body.insertAdjacentHTML('beforeend', chatbotMarkup);

// Chatbot functionality
var chatbotElements = {
  toggler: document.querySelector(".chatbot-toggler"),
  closeBtn: document.querySelector(".chatbot .close-btn"),
  chatbox: document.querySelector(".chatbox"),
  chatInput: document.querySelector(".chat-input textarea"),
  sendBtn: document.querySelector(".chat-input #send-btn")
};

var chatState = {
  userMessage: null,
  API_KEY: "",
  inputInitHeight: chatbotElements.chatInput.scrollHeight
};

function createChatLi(message, className) {
  var chatLi = document.createElement("li");
  chatLi.className = "chat " + className;
  chatLi.innerHTML = className === "outgoing" 
    ? '<p></p>' 
    : '<span class="material-symbols-outlined" aria-hidden="true">smart_toy</span><p></p>';
  chatLi.querySelector("p").textContent = message;
  return chatLi;
}

function generateResponse(chatElement) {
  var API_URL = "https://openai-proxy.napdev.workers.dev?url=https://api.openai.com/v1/chat/completions";
  var messageElement = chatElement.querySelector("p");

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: chatState.userMessage }]
    })
  })
  .then(function(response) {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then(function(data) {
    if (data.choices && data.choices[0]) {
      messageElement.textContent = data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response format");
    }
  })
  .catch(function(error) {
    console.error("Error:", error);
    messageElement.classList.add("error");
    messageElement.textContent = "Oops! Something went wrong. Please try again.";
  })
  .finally(function() {
    chatbotElements.chatbox.scrollTo(0, chatbotElements.chatbox.scrollHeight);
  });
}

function handleChat() {
  chatState.userMessage = chatbotElements.chatInput.value.trim();
  if (!chatState.userMessage) return;

  chatbotElements.chatInput.value = "";
  chatbotElements.chatInput.style.height = chatState.inputInitHeight + "px";

  chatbotElements.chatbox.appendChild(createChatLi(chatState.userMessage, "outgoing"));
  chatbotElements.chatbox.scrollTo(0, chatbotElements.chatbox.scrollHeight);

  setTimeout(function() {
    var incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbotElements.chatbox.appendChild(incomingChatLi);
    chatbotElements.chatbox.scrollTo(0, chatbotElements.chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
}

// Event listeners
chatbotElements.chatInput.addEventListener("input", function() {
  this.style.height = chatState.inputInitHeight + "px";
  this.style.height = this.scrollHeight + "px";
});

chatbotElements.chatInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

chatbotElements.sendBtn.addEventListener("click", handleChat);
chatbotElements.closeBtn.addEventListener("click", function() {
  document.body.classList.remove("show-chatbot");
});
chatbotElements.toggler.addEventListener("click", function() {
  document.body.classList.toggle("show-chatbot");
});

// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-VNJX66Z0YF");