const socket = io();
let map;
let busMarker;

// Default starting location (Greater Noida)
const startLocation = { lat: 28.4744, lng: 77.5040 };

async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        zoom: 15,
        center: startLocation,
        mapId: "DEMO_MAP_ID", // Map ID is required for AdvancedMarkerElement
    });

    // Listen for bus location updates from the server
    socket.on('busLocation', (data) => {
        console.log("Received new location:", data);
        const newPosition = { lat: data.latitude, lng: data.longitude };

        if (busMarker) {
            // Move existing marker
            busMarker.position = newPosition;
        } else {
            // Create new marker
            const busIconImg = document.createElement("img");
            busIconImg.src = "https://cdn-icons-png.flaticon.com/512/3448/3448339.png";
            busIconImg.style.width = "40px";
            busIconImg.style.height = "40px";

            busMarker = new AdvancedMarkerElement({
                map: map,
                position: newPosition,
                content: busIconImg,
                title: "Bus 1",
            });
        }

        // Smoothly pan to the new location
        map.panTo(newPosition);
    });
}

initMap();
