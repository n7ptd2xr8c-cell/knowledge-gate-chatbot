function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function addMessage(messageText, senderType) {
    // 1. Create a new <div> element called messageDiv to hold the message.
    const messageDiv = document.createElement('div');
    // 2. Add two CSS classes to messageDiv: 'message' and senderType ('user' or 'bot').
    messageDiv.classList.add('message', senderType);
    // 3. Replace newline characters in messageText with <br> and set as HTML content.
    const safeText = escapeHTML(messageText).replace(/\n/g, "<br>");
    messageDiv.innerHTML = safeText;
    // 4. Get the container element with ID 'messages' and save as "messagesContainer".
    const messagesContainer = document.getElementById('messages');
    // 5. Add messageDiv to the messages container.
    messagesContainer.appendChild(messageDiv);
    // 6. Scroll to bottom:
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {
    addMessage(
        "Hello, I am your intelligent books recommendation chatbot \"01Books\".\nGive me a keyword!\nExample: Mathematics",
        'bot'
    );
});

document.getElementById("send-button").addEventListener("click", sendMessage);

function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();

    if (userInput) {
        // Call addMessage function to display the user's message
        addMessage(userInput, 'user');
        // Clear the input field by setting its value to an empty string
        document.getElementById("user-input").value = '';
    }
}

const userInputField = document.getElementById("user-input");

userInputField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});