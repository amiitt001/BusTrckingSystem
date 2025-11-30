```
import { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, set, update } from 'firebase/database';
import { calculateDistance } from '../utils/geo';
import DriverDashboard from '../components/DriverDashboard';

const Driver = () => {
  // Shift State
  const [isShiftStarted, setIsShiftStarted] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [busNumber, setBusNumber] = useState('');

  // Tracking State
  const [status, setStatus] = useState('Waiting for GPS...');
  const [isSimulating, setIsSimulating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const [issue, setIssue] = useState('OK');
  const [speed, setSpeed] = useState(0);

  // Throttling Refs
  const lastBroadcastTime = useRef<number>(0);
  const lastBroadcastPos = useRef<{ lat: number; lng: number } | null>(null);
  const simIntervalId = useRef<NodeJS.Timeout | null>(null);

  const startShift = () => {
    if (!routeId || !busNumber) {
      setError("Please enter Route ID and Bus Number");
      return;
    }
    
    // Request Geolocation Permission immediately
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission granted
        setIsShiftStarted(true);
        setError('');
        
        // Initialize in DB
        set(ref(database, 'bus/info'), {
          routeId,
          busNumber,
          status: 'Active',
          startTime: Date.now()
        });
      },
      (err) => {
        // Permission denied or error
        console.error(err);
        setError("Location permission denied. Please enable GPS.");
      }
    );
  };

  const stopShift = () => {
    setIsShiftStarted(false);
    setIsSimulating(false);
    if (simIntervalId.current) clearInterval(simIntervalId.current);
    setStatus('Shift Ended');
    
    // Update DB
    update(ref(database, 'bus/info'), {
      status: 'Inactive',
      endTime: Date.now()
    });
  };

  const broadcastLocation = (lat: number, lng: number, currentSpeed?: number) => {
    const now = Date.now();
    let shouldBroadcast = false;

    // Rule 1: Time-based throttling (5 seconds)
    if (now - lastBroadcastTime.current > 5000) {
      shouldBroadcast = true;
    } 
    // Rule 2: Distance-based throttling (20 meters)
    else if (lastBroadcastPos.current) {
      const dist = calculateDistance(
        lastBroadcastPos.current.lat, 
        lastBroadcastPos.current.lng, 
        lat, 
        lng
      );
      if (dist > 20) {
        shouldBroadcast = true;
      }
    } else {
      shouldBroadcast = true; // First update
    }

    if (shouldBroadcast) {
      setLocation({ lat, lng });
      if (currentSpeed !== undefined) setSpeed(Math.round(currentSpeed * 3.6)); // Convert m/s to km/h
      
      lastBroadcastTime.current = now;
      lastBroadcastPos.current = { lat, lng };

      update(ref(database, 'bus/location'), {
        latitude: lat,
        longitude: lng,
        timestamp: now,
        status: issue,
        speed: currentSpeed ? Math.round(currentSpeed * 3.6) : 0
      }).catch((err) => {
        console.error("Firebase Error:", err);
      });
    }
  };

  const reportIssue = (newIssue: string) => {
    setIssue(newIssue);
    // Immediately update status in DB
    update(ref(database, 'bus/location'), {
      status: newIssue,
      timestamp: Date.now()
    });
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      // Stop Simulation
      if (simIntervalId.current) clearInterval(simIntervalId.current);
      simIntervalId.current = null;
      setIsSimulating(false);
      setStatus('Simulation Paused');
    } else {
      // Start Simulation
      setIsSimulating(true);
      setStatus('Simulating...');
      
      let simLat = 28.4744;
      let simLng = 77.5040;

      simIntervalId.current = setInterval(() => {
        // Simulate movement
        simLat += 0.0001; 
        simLng += 0.0001;
        broadcastLocation(simLat, simLng, 10); // Simulate 10 m/s speed
      }, 1000); 
    }
  };

  useEffect(() => {
    if (isSimulating || !isShiftStarted) return;

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setStatus('Live Tracking');
          broadcastLocation(
            position.coords.latitude, 
            position.coords.longitude,
            position.coords.speed || 0
          );
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setStatus('GPS Error');
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isSimulating, isShiftStarted, issue]);

  // If shift hasn't started, show a simple form to enter details
  // But we want to use the Dashboard UI even for the start screen if possible, 
  // or at least wrap the form nicely. 
  // For now, we'll keep the simple form for input, then switch to Dashboard.
  
  if (!isShiftStarted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">🚍 Setup Shift</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Route ID</label>
              <input 
                type="text" 
                placeholder="e.g., R-101"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full p-4 bg-slate-700 rounded-xl border border-slate-600 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Bus Number</label>
              <input 
                type="text" 
                placeholder="e.g., UP-16-1234"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="w-full p-4 bg-slate-700 rounded-xl border border-slate-600 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <button 
              onClick={startShift}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all"
            >
              Initialize Dashboard
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DriverDashboard 
      isShiftStarted={isShiftStarted}
      status={status}
      speed={speed}
      onStartShift={startShift} // Not really used once started, but kept for prop type
      onStopShift={stopShift}
      onReportIssue={reportIssue}
      routeId={routeId}
      busNumber={busNumber}
    />
  );
};

export default Driver;
```
