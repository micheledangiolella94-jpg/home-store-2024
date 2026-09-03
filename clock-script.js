// Timezone data with offset information
const timezones = [
    // North America
    { name: 'New York', zone: 'America/New_York', icon: '🗽' },
    { name: 'Los Angeles', zone: 'America/Los_Angeles', icon: '🌴' },
    { name: 'Chicago', zone: 'America/Chicago', icon: '🌆' },
    { name: 'Denver', zone: 'America/Denver', icon: '⛰️' },
    { name: 'Toronto', zone: 'America/Toronto', icon: '🍁' },
    { name: 'Mexico City', zone: 'America/Mexico_City', icon: '🌮' },
    
    // South America
    { name: 'São Paulo', zone: 'America/Sao_Paulo', icon: '🇧🇷' },
    { name: 'Buenos Aires', zone: 'America/Argentina/Buenos_Aires', icon: '🇦🇷' },
    
    // Europe
    { name: 'London', zone: 'Europe/London', icon: '🇬🇧' },
    { name: 'Paris', zone: 'Europe/Paris', icon: '🗼' },
    { name: 'Berlin', zone: 'Europe/Berlin', icon: '🍺' },
    { name: 'Moscow', zone: 'Europe/Moscow', icon: '🇷🇺' },
    
    // Middle East
    { name: 'Dubai', zone: 'Asia/Dubai', icon: '🏙️' },
    { name: 'Istanbul', zone: 'Europe/Istanbul', icon: '🕌' },
    
    // Asia
    { name: 'Tokyo', zone: 'Asia/Tokyo', icon: '🗾' },
    { name: 'Shanghai', zone: 'Asia/Shanghai', icon: '🏯' },
    { name: 'Hong Kong', zone: 'Asia/Hong_Kong', icon: '🏢' },
    { name: 'Singapore', zone: 'Asia/Singapore', icon: '🌴' },
    { name: 'Bangkok', zone: 'Asia/Bangkok', icon: '🇹🇭' },
    { name: 'Delhi', zone: 'Asia/Kolkata', icon: '🇮🇳' },
    { name: 'Mumbai', zone: 'Asia/Kolkata', icon: '🎬' },
    { name: 'Seoul', zone: 'Asia/Seoul', icon: '🇰🇷' },
    
    // Africa
    { name: 'Cairo', zone: 'Africa/Cairo', icon: '🏛️' },
    { name: 'Johannesburg', zone: 'Africa/Johannesburg', icon: '🦁' },
    
    // Oceania
    { name: 'Sydney', zone: 'Australia/Sydney', icon: '🦘' },
    { name: 'Auckland', zone: 'Pacific/Auckland', icon: '🇳🇿' },
    { name: 'Fiji', zone: 'Pacific/Fiji', icon: '🏝️' },
];

// State
let activeClock = [];
let timeFormat = '24'; // 24 or 12

// DOM Elements
const timezoneSelect = document.getElementById('timezoneSelect');
const clocksContainer = document.getElementById('clocksContainer');
const formatRadios = document.querySelectorAll('input[name="format"]');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateTimezoneSelect();
    setupEventListeners();
    
    // Add default clocks
    addClock('America/New_York'); // New York
    addClock('Europe/London');    // London
    addClock('Asia/Tokyo');       // Tokyo
    
    // Start clock updates
    updateAllClocks();
    setInterval(updateAllClocks, 1000);
});

// Populate timezone select dropdown
function populateTimezoneSelect() {
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.zone;
        option.textContent = `${tz.icon} ${tz.name}`;
        timezoneSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Timezone select change
    timezoneSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            addClock(e.target.value);
            e.target.value = ''; // Reset select
        }
    });

    // Time format change
    formatRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            timeFormat = e.target.value;
            updateAllClocks();
        });
    });
}

// Add a new clock
function addClock(zone) {
    // Check if already added
    if (activeClock.includes(zone)) {
        showNotification('This timezone is already displayed!', 'warning');
        return;
    }

    activeClock.push(zone);
    saveClocksToLocalStorage();
    renderClocks();
}

// Remove a clock
function removeClock(zone) {
    activeClock = activeClock.filter(z => z !== zone);
    saveClocksToLocalStorage();
    renderClocks();
}

// Render all clocks
function renderClocks() {
    clocksContainer.innerHTML = '';

    if (activeClock.length === 0) {
        clocksContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">🕐</div>
                <div class="empty-state-text">Add a timezone to get started!</div>
            </div>
        `;
        return;
    }

    activeClock.forEach((zone) => {
        const tzInfo = timezones.find(tz => tz.zone === zone);
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.id = `clock-${zone}`;
        
        // Add default styling to first clock
        if (activeClock[0] === zone) {
            card.classList.add('default');
        }

        card.onclick = () => removeClock(zone);

        card.innerHTML = `
            <div class="remove-hint">✕</div>
            <div class="timezone-name">${tzInfo ? tzInfo.icon + ' ' + tzInfo.name : zone}</div>
            <div class="clock-display" data-zone="${zone}">--:--:--</div>
            <div class="clock-info">
                <div class="clock-date" data-date="${zone}"></div>
                <div class="clock-offset" data-offset="${zone}"></div>
            </div>
        `;

        clocksContainer.appendChild(card);
    });

    updateAllClocks();
}

// Update all clocks
function updateAllClocks() {
    activeClock.forEach(zone => {
        updateClock(zone);
    });
}

// Update single clock
function updateClock(zone) {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: timeFormat === '12'
        });

        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const timeParts = formatter.formatToParts(now);
        let timeString = '';

        timeParts.forEach(part => {
            if (part.type !== 'literal') {
                timeString += part.value;
            } else if (part.value === ':' || part.value === ' ') {
                timeString += part.value;
            }
        });

        const dateString = dateFormatter.format(now);

        // Calculate UTC offset
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(now.toLocaleString('en-US', { timeZone: zone }));
        const offset = (tzDate - utcDate) / (1000 * 60 * 60);
        const offsetString = `UTC ${offset >= 0 ? '+' : ''}${offset.toFixed(1).replace('.0', '')}`;

        // Update DOM
        const clockDisplay = document.querySelector(`[data-zone="${zone}"]`);
        const clockDate = document.querySelector(`[data-date="${zone}"]`);
        const clockOffset = document.querySelector(`[data-offset="${zone}"]`);

        if (clockDisplay) clockDisplay.textContent = timeString;
        if (clockDate) clockDate.textContent = dateString;
        if (clockOffset) clockOffset.textContent = offsetString;

    } catch (error) {
        console.error(`Error updating clock for ${zone}:`, error);
    }
}

// Save clocks to localStorage
function saveClocksToLocalStorage() {
    localStorage.setItem('activeClocks', JSON.stringify(activeClock));
    localStorage.setItem('timeFormat', timeFormat);
}

// Load clocks from localStorage
function loadClocksFromLocalStorage() {
    const saved = localStorage.getItem('activeClocks');
    if (saved) {
        try {
            activeClock = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading clocks:', e);
        }
    }

    const savedFormat = localStorage.getItem('timeFormat');
    if (savedFormat) {
        timeFormat = savedFormat;
        document.querySelector(`input[value="${timeFormat}"]`).checked = true;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'warning' ? '#FFE66D' : '#4ECDC4'};
        color: ${type === 'warning' ? '#000' : '#fff'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to open timezone selector
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        timezoneSelect.focus();
    }
});

// Load saved clocks on startup
loadClocksFromLocalStorage();
renderClocks();