// ------------------
// Helper functions
// ------------------
function escapeHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function addMessage(messageText, senderType) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", senderType);

    messageDiv.innerHTML =
        senderType === "user"
            ? escapeHTML(messageText).replace(/\n/g, "<br>")
            : messageText.replace(/\n/g, "<br>");

    const messagesContainer = document.getElementById("messages");
    messagesContainer.appendChild(messageDiv);

    forceScrollToBottom(); // ✅ αντί για scrollTop
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ------------------
// Mode toggle
// ------------------
let isMovieMode = localStorage.getItem("isMovieMode") === "true";
const toggleInput = document.getElementById("toggle-mode");
const modeLabel = document.getElementById("mode-label");
toggleInput.checked = isMovieMode;
modeLabel.textContent = isMovieMode ? "Movies/Series" : "Anime";
document.body.classList.add(isMovieMode ? 'movie-mode' : 'anime-mode');

toggleInput.addEventListener("change", () => {
    isMovieMode = toggleInput.checked;
    localStorage.setItem("isMovieMode", isMovieMode);
    modeLabel.textContent = isMovieMode ? "Movies/Series" : "Anime";
    document.body.classList.toggle("movie-mode", isMovieMode);
    document.body.classList.toggle("anime-mode", !isMovieMode);

    // Clear chat & show welcome message
    document.getElementById("messages").innerHTML = "";
    showWelcomeMessage();
});

// ------------------
// Welcome message
// ------------------
function showWelcomeMessage() {
    if (isMovieMode) {
        addMessage(
            "Hello! 👋 I'm your TV Shows & Movies recommendation chatbot!\n\n" +
            "Give me a show or movie name!\n\n" +
            "Example: Friends, Breaking Bad, Interstellar",
            "bot"
        );
    } else {
        addMessage(
            "Hello! 👋 I'm your Anime recommendation chatbot 🤖🎌\n\n" +
            "I help you discover amazing anime series using real data from MyAnimeList.\n\n" +
            "Just type:\n• An anime title\n• Or a genre / keyword\n\nExamples:\nNaruto\nOne Piece\nAttack on Titan\nRomance\nAction",
            "bot"
        );
    }
}

// ------------------
// Initial setup
// ------------------
document.addEventListener("DOMContentLoaded", () => {
    // Stars
    const starsContainer = document.querySelector(".stars");
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("div");
        star.style.position = "fixed"; // fixed για να γεμίζουν όλο το viewport
        star.style.width = "2px";
        star.style.height = "2px";
        star.style.background = "white";
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.opacity = Math.random();
        star.style.borderRadius = "50%";
        star.style.boxShadow = "0 0 2px white";
        starsContainer.appendChild(star);
    }

    showWelcomeMessage();
});

// ------------------
// Send message
// ------------------
document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
});

function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;
    addMessage(userInput, "user");
    document.getElementById("user-input").value = "";

    if (isMovieMode) {
        getMovieOrSeriesRecommendation(userInput).then(resp => addMessage(resp, "bot"));
    } else {
        getAnimeRecommendation(userInput).then(resp => addMessage(resp, "bot"));
    }
}

// ------------------
// Anime API (Jikan)
// ------------------
async function getAnimeRecommendation(query) {
    try {
        const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.data || data.data.length === 0) return `No anime found for "${query}".`;

        const shuffled = shuffleArray(data.data);
        const selected = shuffled.slice(0, 5);

        let message = "🎌 Anime recommendations:<br><br>";
        selected.forEach(anime => {
            const title = anime.title || "Unknown title";
            const year = anime.year || "Unknown year";
            const score = anime.score || "No score";
            const genres = anime.genres?.map(g => g.name).join(", ") || "Unknown genres";
            const url = anime.url || "#"; // Jikan URL

            message += `🍥 <strong><a href="${url}" target="_blank">${title}</a></strong> (${year})<br>`;
            message += `⭐ Score: ${score}<br>🎭 Genres: ${genres}<br><br>`;
        });
        return message;
    } catch (e) { console.error(e); return "Sorry, I couldn't fetch anime right now 😢"; }
}

// ------------------
// Movies/Series API (TVmaze)
// ------------------
async function getMovieOrSeriesRecommendation(query) {
    let message = "🎬 Movie/Series recommendations:<br><br>";

    // 1️⃣ TVmaze (series)
    const tvmazeResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const tvData = await tvmazeResponse.json();
    const tvResults = tvData.slice(0, 5); // πρώτα 5

    tvResults.forEach(item => {
        const show = item.show;
        message += `📺 <strong><a href="${show.url}" target="_blank">${show.name}</a></strong> (${show.premiered?.split("-")[0] || "Unknown"})<br>Genres: ${show.genres.join(", ")}<br><br>`;
    });

    // 2️⃣ OMDb (movies)
    const omdbResponse = await fetch(`https://www.omdbapi.com/?apikey=e6427b5b&s=${encodeURIComponent(query)}`);
    const omdbData = await omdbResponse.json();

    if (omdbData.Search) {
        omdbData.Search.slice(0, 5).forEach(movie => {
            message += `🎬 <strong><a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank">${movie.Title}</a></strong> (${movie.Year})<br>Type: ${movie.Type}<br><br>`;
        });
    }

    return message || `No movies or series found for "${query}".`;
}

const PASSWORD = "alfani";

function checkPassword() {
    const input = document.getElementById("password-input").value;
    if (input === PASSWORD) {
        document.getElementById("password-screen").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else {
        document.getElementById("password-error").innerText = "Wrong password";
    }
}

// 🔑 Enter key support for password screen
document.getElementById("password-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        checkPassword();
    }
});

document.getElementById("password-input").addEventListener("input", () => {
    document.getElementById("password-error").textContent = "";
});

function forceScrollToBottom() {
    const messages = document.getElementById("messages");
    if (!messages) return;

    messages.scrollTop = messages.scrollHeight;

    // 🔧 iOS Safari fix (reflow)
    setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
    }, 100);
}

document.getElementById("user-input").addEventListener("focus", () => {
    setTimeout(forceScrollToBottom, 300);
});
