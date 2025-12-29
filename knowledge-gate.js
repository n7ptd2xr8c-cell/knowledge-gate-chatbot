/**
 * ============================================================================
 * KNOWLEDGE GATE - Professional Chatbot Application
 * ============================================================================
 * A sophisticated chatbot for anime and movie/series recommendations
 * with theme switching and persistent user preferences
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    PASSWORD: "alfani",
    STORAGE_KEYS: {
        IS_MOVIE_MODE: "isMovieMode",
    },
    DEFAULTS: {
        STAR_COUNT: 200,
        RECOMMENDATIONS_LIMIT: 5,
        SCROLL_DELAY: 100,
        FOCUS_DELAY: 300,
    },
    SELECTORS: {
        APP: "#app",
        PASSWORD_SCREEN: "#password-screen",
        PASSWORD_INPUT: "#password-input",
        PASSWORD_ERROR: "#password-error",
        CHATBOT: "#chatbot-container",
        MESSAGES: "#messages",
        USER_INPUT: "#user-input",
        SEND_BUTTON: "#send-button",
        TOGGLE_MODE: "#toggle-mode",
        MODE_LABEL: "#mode-label",
        STARS_CONTAINER: ".stars",
    },
    CSS_CLASSES: {
        MESSAGE: "message",
        MOVIE_MODE: "movie-mode",
        ANIME_MODE: "anime-mode",
    },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Adds a message to the chatbox
 * @param {string} messageText - The message content
 * @param {string} senderType - Either "user" or "bot"
 */
function addMessage(messageText, senderType) {
    if (!messageText || typeof messageText !== "string") {
        console.warn("Invalid message text:", messageText);
        return;
    }

    const messageDiv = document.createElement("div");
    messageDiv.classList.add(CONFIG.CSS_CLASSES.MESSAGE, senderType);

    const sanitizedText = senderType === "user" ? escapeHTML(messageText) : messageText;
    messageDiv.innerHTML = sanitizedText.replace(/\n/g, "<br>");

    const messagesContainer = document.querySelector(CONFIG.SELECTORS.MESSAGES);
    if (!messagesContainer) {
        console.error("Messages container not found");
        return;
    }

    messagesContainer.appendChild(messageDiv);
    forceScrollToBottom();
}

// ============================================================================
// APP STATE MANAGEMENT
// ============================================================================

class AppState {
    constructor() {
        this.isMovieMode = this.loadMovieMode();
        this.initializeMode();
    }

    loadMovieMode() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.IS_MOVIE_MODE) === "true";
    }

    setMovieMode(value) {
        this.isMovieMode = value;
        localStorage.setItem(CONFIG.STORAGE_KEYS.IS_MOVIE_MODE, value);
    }

    initializeMode() {
        const toggleInput = document.querySelector(CONFIG.SELECTORS.TOGGLE_MODE);
        const modeLabel = document.querySelector(CONFIG.SELECTORS.MODE_LABEL);

        if (!toggleInput || !modeLabel) {
            console.error("Toggle or mode label element not found");
            return;
        }

        toggleInput.checked = this.isMovieMode;
        this.updateModeLabel(modeLabel);
        this.applyModeClass();

        toggleInput.addEventListener("change", () => this.handleModeChange());
    }

    handleModeChange() {
        this.setMovieMode(document.querySelector(CONFIG.SELECTORS.TOGGLE_MODE).checked);
        this.updateModeLabel(document.querySelector(CONFIG.SELECTORS.MODE_LABEL));
        this.applyModeClass();
        this.clearChat();
        showWelcomeMessage();
    }

    updateModeLabel(modeLabel) {
        modeLabel.textContent = this.isMovieMode ? "Movies/Series" : "Anime";
    }

    applyModeClass() {
        document.body.classList.toggle(CONFIG.CSS_CLASSES.MOVIE_MODE, this.isMovieMode);
        document.body.classList.toggle(CONFIG.CSS_CLASSES.ANIME_MODE, !this.isMovieMode);
    }

    clearChat() {
        const messagesContainer = document.querySelector(CONFIG.SELECTORS.MESSAGES);
        if (messagesContainer) {
            messagesContainer.innerHTML = "";
        }
    }
}

let appState = new AppState();

// ============================================================================
// WELCOME MESSAGE SYSTEM
// ============================================================================

const WELCOME_MESSAGES = {
    anime: {
        title: "Hello! 👋 I'm your Anime recommendation chatbot 🤖🎌",
        content:
            "I help you discover amazing anime series using real data from MyAnimeList.\n\n" +
            "Just type:\n• An anime title\n• Or a genre / keyword\n\n" +
            "Examples:\nNaruto\nOne Piece\nAttack on Titan\nRomance\nAction",
    },
    movie: {
        title: "Hello! 👋 I'm your TV Shows & Movies recommendation chatbot!",
        content:
            "Give me a show or movie name!\n\n" +
            "Example: Friends, Breaking Bad, Interstellar",
    },
};

/**
 * Displays the welcome message based on current app mode
 */
function showWelcomeMessage() {
    const mode = appState.isMovieMode ? "movie" : "anime";
    const message = WELCOME_MESSAGES[mode];
    addMessage(`${message.title}\n\n${message.content}`, "bot");
}

// ============================================================================
// BACKGROUND SYSTEM
// ============================================================================

/**
 * Initializes the starfield background animation
 */
function initializeBackground() {
    const starsContainer = document.querySelector(CONFIG.SELECTORS.STARS_CONTAINER);
    if (!starsContainer) {
        console.error("Stars container not found");
        return;
    }

    for (let i = 0; i < CONFIG.DEFAULTS.STAR_COUNT; i++) {
        const star = document.createElement("div");
        star.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: white;
            top: ${Math.random() * 100}vh;
            left: ${Math.random() * 100}vw;
            opacity: ${Math.random()};
            border-radius: 50%;
            box-shadow: 0 0 2px white;
            z-index: 0;
            pointer-events: none;
        `;
        starsContainer.appendChild(star);
    }
}

// ============================================================================
// MESSAGE SENDING SYSTEM
// ============================================================================

class MessageHandler {
    constructor() {
        this.userInput = document.querySelector(CONFIG.SELECTORS.USER_INPUT);
        this.sendButton = document.querySelector(CONFIG.SELECTORS.SEND_BUTTON);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (!this.sendButton || !this.userInput) {
            console.error("Message handler elements not found");
            return;
        }

        this.sendButton.addEventListener("click", () => this.send());
        this.userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.send();
            }
        });
        this.userInput.addEventListener("focus", () => {
            setTimeout(() => forceScrollToBottom(), CONFIG.DEFAULTS.FOCUS_DELAY);
        });
    }

    async send() {
        const message = this.userInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        this.userInput.value = "";

        try {
            const response = appState.isMovieMode
                ? await getMovieOrSeriesRecommendation(message)
                : await getAnimeRecommendation(message);
            addMessage(response, "bot");
        } catch (error) {
            console.error("Error sending message:", error);
            addMessage(
                "Sorry, something went wrong. Please try again.",
                "bot"
            );
        }
    }
}

let messageHandler = new MessageHandler();

// ============================================================================
// API INTEGRATION - ANIME (JIKAN API)
// ============================================================================

const ANIME_API = {
    BASE_URL: "https://api.jikan.moe/v4/anime",
    TIMEOUT: 10000,
};

/**
 * Fetches anime recommendations from Jikan API
 * @param {string} query - The search query
 * @returns {Promise<string>} Formatted recommendation message
 */
async function getAnimeRecommendation(query) {
    try {
        const url = new URL(ANIME_API.BASE_URL);
        url.searchParams.append("q", query);
        url.searchParams.append("limit", CONFIG.DEFAULTS.RECOMMENDATIONS_LIMIT * 2);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ANIME_API.TIMEOUT);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            return `❌ No anime found for "<strong>${escapeHTML(query)}</strong>". Try another search!`;
        }

        const shuffled = shuffleArray(data.data);
        const selected = shuffled.slice(0, CONFIG.DEFAULTS.RECOMMENDATIONS_LIMIT);

        return formatAnimeRecommendations(selected);
    } catch (error) {
        console.error("Anime API error:", error);
        return "⚠️ Unable to fetch anime recommendations. Please try again later.";
    }
}

/**
 * Formats anime recommendations into HTML
 * @param {Array} animeList - Array of anime objects
 * @returns {string} Formatted HTML message
 */
function formatAnimeRecommendations(animeList) {
    let message = "🎌 <strong>Anime Recommendations:</strong><br><br>";

    animeList.forEach((anime, index) => {
        const title = escapeHTML(anime.title || "Unknown title");
        const year = anime.year || "Unknown year";
        const score = anime.score ?? "N/A";
        const genres = anime.genres?.map(g => g.name).join(", ") || "Unknown genres";
        const url = anime.url || "#";

        message += `${index + 1}. <strong><a href="${url}" target="_blank" rel="noopener">${title}</a></strong> (${year})<br>`;
        message += `⭐ Rating: ${score} | 🎭 ${genres}<br><br>`;
    });

    return message;
}

// ============================================================================
// API INTEGRATION - MOVIES & SERIES
// ============================================================================

const TV_API = {
    TVMAZE_BASE: "https://api.tvmaze.com/search/shows",
    OMDB_BASE: "https://www.omdbapi.com/",
    OMDB_KEY: "e6427b5b",
    TIMEOUT: 10000,
};

/**
 * Fetches movie and TV series recommendations
 * @param {string} query - The search query
 * @returns {Promise<string>} Formatted recommendation message
 */
async function getMovieOrSeriesRecommendation(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TV_API.TIMEOUT);

        // Fetch from both APIs in parallel
        const [tvResults, omdbResults] = await Promise.all([
            fetchTVMazeResults(encodedQuery, controller),
            fetchOMDbResults(encodedQuery, controller),
        ]);

        clearTimeout(timeoutId);

        if (tvResults.length === 0 && omdbResults.length === 0) {
            return `❌ No movies or series found for "<strong>${escapeHTML(
                query
            )}</strong>". Try another search!`;
        }

        return formatMediaRecommendations(tvResults, omdbResults);
    } catch (error) {
        console.error("Media API error:", error);
        return "⚠️ Unable to fetch recommendations. Please try again later.";
    }
}

/**
 * Fetches TV series from TVMaze API
 * @param {string} query - Encoded search query
 * @param {AbortController} controller - Abort controller for timeout
 * @returns {Promise<Array>} Array of TV show results
 */
async function fetchTVMazeResults(query, controller) {
    try {
        const response = await fetch(
            `${TV_API.TVMAZE_BASE}?q=${query}`,
            { signal: controller.signal }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return data.slice(0, CONFIG.DEFAULTS.RECOMMENDATIONS_LIMIT);
    } catch (error) {
        console.warn("TVMaze API error:", error);
        return [];
    }
}

/**
 * Fetches movies from OMDb API
 * @param {string} query - Encoded search query
 * @param {AbortController} controller - Abort controller for timeout
 * @returns {Promise<Array>} Array of movie results
 */
async function fetchOMDbResults(query, controller) {
    try {
        const response = await fetch(
            `${TV_API.OMDB_BASE}?apikey=${TV_API.OMDB_KEY}&s=${query}`,
            { signal: controller.signal }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return data.Search ? data.Search.slice(0, CONFIG.DEFAULTS.RECOMMENDATIONS_LIMIT) : [];
    } catch (error) {
        console.warn("OMDb API error:", error);
        return [];
    }
}

/**
 * Formats media recommendations into HTML
 * @param {Array} tvResults - TVMaze results
 * @param {Array} omdbResults - OMDb results
 * @returns {string} Formatted HTML message
 */
function formatMediaRecommendations(tvResults, omdbResults) {
    let message = "🎬 <strong>Recommendations:</strong><br><br>";

    // Add TV Series
    tvResults.forEach((item, index) => {
        const show = item.show;
        const year = show.premiered?.split("-")[0] || "Unknown";
        const genres = show.genres?.join(", ") || "Unknown genres";

        message += `📺 <strong><a href="${show.url}" target="_blank" rel="noopener">${escapeHTML(
            show.name
        )}</a></strong> (${year})<br>`;
        message += `🎭 ${genres}<br><br>`;
    });

    // Add Movies
    omdbResults.forEach((movie, index) => {
        message += `🎬 <strong><a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank" rel="noopener">${escapeHTML(
            movie.Title
        )}</a></strong> (${movie.Year})<br>`;
        message += `📝 Type: ${movie.Type}<br><br>`;
    });

    return message;
}

// ============================================================================
// AUTHENTICATION SYSTEM
// ============================================================================

class PasswordManager {
    constructor() {
        this.passwordInput = document.querySelector(CONFIG.SELECTORS.PASSWORD_INPUT);
        this.passwordError = document.querySelector(CONFIG.SELECTORS.PASSWORD_ERROR);
        this.passwordScreen = document.querySelector(CONFIG.SELECTORS.PASSWORD_SCREEN);
        this.appContainer = document.querySelector(CONFIG.SELECTORS.APP);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (!this.passwordInput) {
            console.error("Password input element not found");
            return;
        }

        document.querySelector("button[onclick='checkPassword()']").addEventListener("click", () => this.checkPassword());
        this.passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.checkPassword();
            }
        });
        this.passwordInput.addEventListener("input", () => this.clearError());
    }

    checkPassword() {
        const input = this.passwordInput.value.trim();
        if (input === CONFIG.PASSWORD) {
            this.unlock();
        } else {
            this.showError("Incorrect password. Please try again.");
        }
    }

    showError(message) {
        if (this.passwordError) {
            this.passwordError.textContent = message;
        }
    }

    clearError() {
        if (this.passwordError) {
            this.passwordError.textContent = "";
        }
    }

    unlock() {
        if (this.passwordScreen) {
            this.passwordScreen.style.display = "none";
        }
        if (this.appContainer) {
            this.appContainer.style.display = "flex";
        }
    }
}

let passwordManager = new PasswordManager();

// ============================================================================
// SCROLL MANAGEMENT
// ============================================================================

/**
 * Forces the messages container to scroll to the bottom
 * Includes iOS Safari fix with reflow delay
 */
function forceScrollToBottom() {
    const messages = document.querySelector(CONFIG.SELECTORS.MESSAGES);
    if (!messages) return;

    messages.scrollTop = messages.scrollHeight;

    // iOS Safari fix: force layout reflow
    setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
    }, CONFIG.DEFAULTS.SCROLL_DELAY);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main application initialization on DOM ready
 */
document.addEventListener("DOMContentLoaded", () => {
    try {
        initializeBackground();
        showWelcomeMessage();
    } catch (error) {
        console.error("Failed to initialize application:", error);
    }
});
