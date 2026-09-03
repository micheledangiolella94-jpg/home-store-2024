// Joke data storage
let currentJoke = null;
let jokeCount = 0;
let favorites = JSON.parse(localStorage.getItem('favoriteJokes')) || [];

// API endpoints
const APIs = {
    general: 'https://official-joke-api.appspot.com/random_joke',
    programming: 'https://official-joke-api.appspot.com/jokes/programming/random',
    knock_knock: 'https://official-joke-api.appspot.com/jokes/knock-knock/random',
    random: 'https://v2.jokeapi.dev/joke/Any'
};

// DOM Elements
const jokeText = document.getElementById('jokeText');
const jokeType = document.getElementById('jokeType');
const jokeCard = document.getElementById('jokeCard');
const spinner = document.getElementById('spinner');
const errorMessage = document.getElementById('errorMessage');
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const jokeCountDisplay = document.getElementById('jokeCount');
const categorySelect = document.getElementById('category');
const toggleFavBtn = document.getElementById('toggleFavBtn');
const favoritesList = document.getElementById('favoritesList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesDisplay();
    categorySelect.addEventListener('change', () => {
        // Auto-fetch joke when category changes
        getJoke();
    });
});

// Get a random joke
async function getJoke() {
    const category = categorySelect.value;
    const apiUrl = category === 'knock-knock' ? 
        APIs.knock_knock : 
        category === 'programming' ? 
        APIs.programming : 
        category === 'random' ? 
        APIs.random : 
        APIs.general;

    try {
        // Show loading state
        spinner.style.display = 'flex';
        errorMessage.style.display = 'none';
        getJokeBtn.disabled = true;

        // Fetch joke
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();
        
        // Parse different API response formats
        if (data.type === 'twopart') {
            // Official Joke API format
            currentJoke = {
                text: `${data.setup} - ${data.delivery}`,
                type: data.type,
                category: data.category || 'General'
            };
        } else if (data.joke) {
            // Joke API format (single part)
            currentJoke = {
                text: data.joke,
                type: 'single',
                category: data.category || 'General'
            };
        } else {
            throw new Error('Unexpected API response');
        }

        // Display joke
        displayJoke();
        jokeCount++;
        updateJokeCount();
        
        // Show share button for compatible platforms
        if (navigator.share) {
            shareBtn.style.display = 'inline-block';
        }

    } catch (error) {
        console.error('Error fetching joke:', error);
        showError('Failed to load joke. Please try again!');
    } finally {
        spinner.style.display = 'none';
        getJokeBtn.disabled = false;
    }
}

// Display joke on screen
function displayJoke() {
    if (!currentJoke) return;

    jokeText.textContent = currentJoke.text;
    jokeType.textContent = `📌 ${currentJoke.type.toUpperCase()} | ${currentJoke.category}`;
    
    // Add animation
    jokeCard.style.animation = 'none';
    setTimeout(() => {
        jokeCard.style.animation = 'fadeIn 0.6s ease-out';
    }, 10);
}

// Copy joke to clipboard
function copyJoke() {
    if (!currentJoke) {
        showError('No joke to copy!');
        return;
    }

    navigator.clipboard.writeText(currentJoke.text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        showError('Failed to copy joke');
    });
}

// Share joke
function shareJoke() {
    if (!currentJoke) return;

    navigator.share({
        title: 'Check out this funny joke!',
        text: currentJoke.text,
        url: window.location.href
    }).catch(err => {
        if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
        }
    });
}

// Add joke to favorites
function addToFavorites() {
    if (!currentJoke) {
        showError('No joke to add!');
        return;
    }

    // Check if already in favorites
    const isDuplicate = favorites.some(fav => fav.text === currentJoke.text);
    
    if (isDuplicate) {
        showError('This joke is already in your favorites!');
        return;
    }

    favorites.push({
        text: currentJoke.text,
        type: currentJoke.type,
        category: currentJoke.category,
        addedAt: new Date().toLocaleString()
    });

    localStorage.setItem('favoriteJokes', JSON.stringify(favorites));
    updateFavoritesDisplay();
    showSuccess('Joke added to favorites! ❤️');
}

// Remove from favorites
function removeFromFavorites(index) {
    favorites.splice(index, 1);
    localStorage.setItem('favoriteJokes', JSON.stringify(favorites));
    updateFavoritesDisplay();
}

// Toggle favorites display
function toggleFavorites() {
    if (favoritesList.style.display === 'none') {
        favoritesList.style.display = 'flex';
        toggleFavBtn.textContent = 'Hide Favorites';
    } else {
        favoritesList.style.display = 'none';
        toggleFavBtn.textContent = 'Show Favorites';
    }
}

// Update favorites display
function updateFavoritesDisplay() {
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="empty-favorites">No favorite jokes yet. Add one!</div>';
        return;
    }

    favorites.forEach((joke, index) => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <div class="favorite-joke-text">${joke.text}</div>
            <div class="favorite-actions">
                <button onclick="copyFavoriteJoke('${index}')">📋 Copy</button>
                <button onclick="removeFromFavorites(${index})">🗑️ Delete</button>
            </div>
        `;
        favoritesList.appendChild(item);
    });
}

// Copy favorite joke
function copyFavoriteJoke(index) {
    const joke = favorites[index];
    navigator.clipboard.writeText(joke.text).then(() => {
        showSuccess('Joke copied! 📋');
    }).catch(() => {
        showError('Failed to copy joke');
    });
}

// Update joke count
function updateJokeCount() {
    jokeCountDisplay.textContent = jokeCount;
}

// Show error message
function showError(message) {
    errorMessage.textContent = `❌ ${message}`;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 4000);
}

// Show success message
function showSuccess(message) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4ECDC4;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        getJoke();
    }
    if (e.code === 'KeyC' && e.ctrlKey) {
        e.preventDefault();
        copyJoke();
    }
    if (e.code === 'KeyF' && e.ctrlKey) {
        e.preventDefault();
        addToFavorites();
    }
});

// Load initial joke
window.addEventListener('load', () => {
    getJoke();
});