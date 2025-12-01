import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { calculateDistance, formatDuration, COLLEGE_LOCATION, BUS_STOPS } from '../utils/geo';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const createIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const busIconOk = createIcon('#22c55e'); // Green
const busIconTraffic = createIcon('#eab308'); // Yellow
const busIconIssue = createIcon('#ef4444'); // Red
const busIconStale = createIcon('#9ca3af'); // Grey
const stopIcon = createIcon('#3b82f6'); // Blue

// Component to update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

interface BusData {
    latitude: number;
    longitude: number;
    timestamp: number;
    status: string;
    [key: string]: unknown;
}

const Tracker = () => {
    const [position, setPosition] = useState<[number, number]>([28.4744, 77.5040]);
    const [busData, setBusData] = useState<BusData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [eta, setEta] = useState<string>('--');
    const [statusColor, setStatusColor] = useState('#22c55e');
    const [notification, setNotification] = useState('');
    const [nearestStop, setNearestStop] = useState<string>('');

    // User location (simulated as College for now, or browser location)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(COLLEGE_LOCATION);

    useEffect(() => {
        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }

        const locationRef = ref(database, 'bus/location');
        const unsubscribe = onValue(locationRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setBusData(data);
                setPosition([data.latitude, data.longitude]);
                setIsConnected(true);

                // 1. Stale Data Detection
                const timeDiff = Date.now() - data.timestamp;
                if (timeDiff > 5 * 60 * 1000) { // 5 minutes
                    setStatusColor('#9ca3af'); // Grey
                    setNotification("⚠️ Bus data is stale (last update > 5 mins ago)");
                } else {
                    // 2. Issue Visualization
                    switch (data.status) {
                        case 'TRAFFIC': setStatusColor('#eab308'); break;
                        case 'BREAKDOWN':
                        case 'PUNCTURE': setStatusColor('#ef4444'); break;
                        default: setStatusColor('#22c55e');
                    }
                    setNotification(data.status !== 'OK' ? `Report: ${data.status}` : '');
                }

                // 3. Geofencing (Arrival at College)
                const distToCollege = calculateDistance(data.latitude, data.longitude, COLLEGE_LOCATION.lat, COLLEGE_LOCATION.lng);
                if (distToCollege < 100) {
                    setNotification("🎉 Bus has arrived at College!");
                }

                // 4. Calculate ETA (to User)
                const distToUser = calculateDistance(data.latitude, data.longitude, userLocation.lat, userLocation.lng);
                const speed = 30; // km/h (Average bus speed)
                const timeHours = (distToUser / 1000) / speed;
                setEta(formatDuration(timeHours * 60));

                // 5. Find Nearest Stop
                let minDist = Infinity;
                let closest = '';
                BUS_STOPS.forEach(stop => {
                    const d = calculateDistance(userLocation.lat, userLocation.lng, stop.lat, stop.lng);
                    if (d < minDist) {
                        minDist = d;
                        closest = stop.name;
                    }
                });
                setNearestStop(closest);
            }
        });

        return () => unsubscribe();
    }, [userLocation]);

    const getMarkerIcon = () => {
        if (statusColor === '#9ca3af') return busIconStale;
        if (statusColor === '#ef4444') return busIconIssue;
        if (statusColor === '#eab308') return busIconTraffic;
        return busIconOk;
    };

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
            {/* Overlay Card */}
            <div className="overlay" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 1000,
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                minWidth: '250px',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚍 Bus Tracker
                </h1>

                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ETA to You</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{eta}</div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nearest Stop</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{nearestStop || 'Calculating...'}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#4b5563' }}>
                    <span style={{
                        width: '10px',
                        height: '10px',
                        background: statusColor,
                        borderRadius: '50%',
                        display: 'inline-block'
                    }}></span>
                    {isConnected ? 'Live Updates' : 'Connecting...'}
                </div>

                {notification && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#eff6ff',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: '#1e40af',
                        border: '1px solid #dbeafe'
                    }}>
                        {notification}
                    </div>
                )}
            </div>

            <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Bus Marker */}
                <Marker position={position} icon={getMarkerIcon()}>
                    <Popup>
                        <b>Bus Location</b><br />
                        Status: {busData?.status || 'Unknown'}
                    </Popup>
                </Marker>

                {/* User Marker */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={stopIcon}>
                    <Popup>You are here</Popup>
                </Marker>

                {/* Bus Stops */}
                {BUS_STOPS.map(stop => (
                    <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
                        <Popup>{stop.name}</Popup>
                    </Marker>
                ))}

                <MapUpdater center={position} />
            </MapContainer>
        </div>
    );
};

export default Tracker;
