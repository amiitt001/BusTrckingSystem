const socket = io();

const statusText = document.getElementById('status-text');
const coordsDisplay = document.getElementById('coords-display');
const latSpan = document.getElementById('lat');
const lngSpan = document.getElementById('lng');
const errorElement = document.getElementById('error');
const simBtn = document.getElementById('sim-btn');

let simulationInterval = null;
// Starting point (Greater Noida)
let simLat = 28.4744;
let simLng = 77.5040;

function updateDisplay(lat, lng, isSimulated = false) {
    statusText.innerHTML = `<span class="pulse"></span>${isSimulated ? 'Simulating...' : 'Live Tracking'}`;
    coordsDisplay.style.display = 'block';
    latSpan.innerText = lat.toFixed(5);
    lngSpan.innerText = lng.toFixed(5);
    errorElement.innerText = '';
}

function sendLocation(lat, lng) {
    socket.emit('busLocation', { latitude: lat, longitude: lng });
}

// --- Real GPS Logic ---
function handleGeoSuccess(position) {
    if (simulationInterval) return; // Ignore real GPS if simulating

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    updateDisplay(lat, lng);
    sendLocation(lat, lng);
}

function handleGeoError(error) {
    if (simulationInterval) return;
    console.error("GPS Error:", error);
    statusText.innerText = "GPS Error";
    errorElement.innerText = `Error: ${error.message}. Try Simulation Mode.`;
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(handleGeoSuccess, handleGeoError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
} else {
    errorElement.innerText = "Geolocation not supported.";
}

// --- Simulation Logic ---
function toggleSimulation() {
    if (simulationInterval) {
        // Stop Simulation
        clearInterval(simulationInterval);
        simulationInterval = null;
        simBtn.innerText = "Start Simulation";
        simBtn.style.backgroundColor = ""; // Reset color
        statusText.innerText = "Simulation Paused";
    } else {
        // Start Simulation
        simBtn.innerText = "Stop Simulation";
        simBtn.style.backgroundColor = "#dc2626"; // Red for stop

        simulationInterval = setInterval(() => {
            // Move slightly roughly North-East
            simLat += 0.0001;
            simLng += 0.0001;

            updateDisplay(simLat, simLng, true);
            sendLocation(simLat, simLng);
        }, 2000); // Update every 2 seconds
    }
}
