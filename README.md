# Knowledge Gate Chatbot

🎌 **Knowledge Gate** is an interactive chatbot that recommends **Anime**, **TV Shows**, and **Movies**.  
You can search by title or genre (e.g., Action, Romance) and get **recommendations with direct links** to the source.  

---

## 🖥️ Technologies
- HTML, CSS, JavaScript
- [TVmaze API](https://www.tvmaze.com/api) for TV Shows
- [OMDb API](http://www.omdbapi.com/) for Movies (requires API key)
- Custom CSS animations for background (stars, moon)  

---

## ⚡ How to Use
1. Open `index.html` in your browser.  
2. Type a title or genre in the input field.  
3. Click **Send** or press Enter to see recommendations.  
4. Use the **toggle button** in the top-right corner to switch between **Anime** and **Movies/Series**.  
5. Each recommendation includes a **link** that opens the source (MyAnimeList, IMDb, TVmaze).  

---

## 🎨 Features
- **Responsive design** for mobile and desktop  
- **Dynamic background** with stars and moon  
- **Color themes** depending on mode (Anime: blue, Movies/Series: red)  
- **No duplicate results**: the same keyword won't show identical recommendations twice  

---

## 🔧 OMDb API Setup
1. Get a free API key from [OMDb](http://www.omdbapi.com/apikey.aspx).  
2. Open `knowledge-gate.js`  
3. Insert your key in the variable:
```js
const OMDB_KEY = "YOUR_API_KEY_HERE";
