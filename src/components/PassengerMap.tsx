import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Clock, MapPin, Bus } from 'lucide-react';

// Custom Icons
const busIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translateY(-50%);">🚌</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const userIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translateY(-50%);">🧍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

// Component to center map on bus
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

interface BusData {
    routeId: string;
    busNumber: string;
    location: { lat: number; lng: number };
    speed: number;
    driverStatus: string;
    lastUpdated: unknown;
}

const PassengerMap = () => {
    const [buses, setBuses] = useState<BusData[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>('ALL');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Fetch Active Buses
    useEffect(() => {
        const q = collection(db, 'active_buses');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const busList: BusData[] = [];
            snapshot.forEach((doc) => {
                busList.push(doc.data() as BusData);
            });
            setBuses(busList);
        });

        return () => unsubscribe();
    }, []);

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // Zoom to selected bus
    const map = useMap();
    useEffect(() => {
        if (selectedRoute !== 'ALL') {
            const selectedBus = buses.find(b => b.routeId === selectedRoute);
            if (selectedBus) {
                map.flyTo([selectedBus.location.lat, selectedBus.location.lng], 16, {
                    animate: true,
                    duration: 1.5
                });
            }
        } else if (buses.length > 0) {
            // Optional: Fit bounds to show all buses if 'ALL' is selected
            // const bounds = L.latLngBounds(buses.map(b => [b.location.lat, b.location.lng]));
            // map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [selectedRoute, buses, map]);

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const eta = useMemo(() => {
        const selectedBus = buses.find(b => b.routeId === selectedRoute);
        if (selectedBus && userLocation) {
            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(selectedBus.location.lat - userLocation.lat);
            const dLon = deg2rad(selectedBus.location.lng - userLocation.lng);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(userLocation.lat)) * Math.cos(deg2rad(selectedBus.location.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // Distance in km

            // Assume average speed of 30 km/h if bus speed is 0
            const speed = selectedBus.speed > 0 ? selectedBus.speed : 30;
            const timeHours = d / speed;
            const timeMinutes = Math.round(timeHours * 60);

            return `${timeMinutes} min`;
        }
        return 'Calculating...';
    }, [buses, selectedRoute, userLocation]);

    const activeBus = buses.find(b => b.routeId === selectedRoute);

    return (
        <div className="h-screen w-full relative bg-slate-100">
            {/* Route Selector Panel */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 max-w-md">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-white/40 flex items-center gap-3 transition-all hover:bg-white/90">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                        <Bus className="w-5 h-5" />
                    </div>
                    <div className="flex-1 relative">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Filter Route
                        </label>
                        <select
                            value={selectedRoute}
                            onChange={(e) => setSelectedRoute(e.target.value)}
                            className="w-full appearance-none bg-transparent text-slate-900 text-base font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Active Routes</option>
                            {buses.map((bus) => (
                                <option key={bus.routeId} value={bus.routeId}>
                                    {bus.routeId} - {bus.busNumber}
                                </option>
                            ))}
                            {buses.length === 0 && <option disabled>No active buses</option>}
                        </select>
                    </div>
                    <div className="pointer-events-none text-slate-400">
                        <Navigation className="w-4 h-4 rotate-90" />
                    </div>
                </div>
            </div>

            <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* User Marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup className="custom-popup">
                            <div className="font-bold text-slate-800">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Bus Markers */}
                {buses
                    .filter(bus => selectedRoute === 'ALL' || bus.routeId === selectedRoute)
                    .map((bus) => (
                        <Marker
                            key={bus.routeId}
                            position={[bus.location.lat, bus.location.lng]}
                            icon={busIcon}
                            opacity={1}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-lg">{bus.routeId}</h3>
                                    <p className="text-sm text-slate-600">{bus.busNumber}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {/* Recenter on Active Bus */}
                {activeBus && <RecenterMap lat={activeBus.location.lat} lng={activeBus.location.lng} />}
            </MapContainer>

            {/* Bottom Sheet Card */}
            {activeBus && (
                <div className="absolute bottom-6 left-4 right-4 z-[1000]">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/40 animate-slide-up">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
                                        Live Tracking
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {activeBus.routeId}
                                </h2>
                                <p className="text-slate-500 font-medium text-sm">
                                    {activeBus.busNumber}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-green-600 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">ETA</span>
                                </div>
                                <div className="text-3xl font-black text-slate-900 leading-none tracking-tight">
                                    {eta}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-400">
                                    <Navigation className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900">
                                    {activeBus.speed} <span className="text-sm font-medium text-slate-400">km/h</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900 truncate">
                                    {activeBus.driverStatus === 'active' ? 'On Route' : activeBus.driverStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassengerMap;
