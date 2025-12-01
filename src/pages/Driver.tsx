import { useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import DriverDashboard from '../components/DriverDashboard';
import SetupShift from '../components/SetupShift';

const Driver = () => {
  const [isShiftStarted, setIsShiftStarted] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Refs for simulation
  const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentSimIndex = useRef(0);
  const watchId = useRef<number | null>(null);

  // Simulated Route (Circular Path)
  const simulatedRoute = [
    { lat: 28.6139, lng: 77.2090 }, // New Delhi
    { lat: 28.5355, lng: 77.3910 }, // Noida
    { lat: 28.4595, lng: 77.0266 }, // Gurgaon
    { lat: 28.6139, lng: 77.2090 }  // Back to New Delhi
  ];

  const [isLoading, setIsLoading] = useState(false);

  const handleStartShift = async () => {
    if (!routeId || !busNumber) {
      setError('Please enter both Route ID and Bus Number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if route already exists (only if online)
      const routeRef = doc(db, 'active_buses', routeId);
      try {
        const routeSnap = await getDoc(routeRef);
        if (routeSnap.exists()) {
          const data = routeSnap.data();
          const lastUpdated = data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(data.lastUpdated);
          const now = new Date();
          const diffInMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

          if (diffInMinutes < 15) {
            setError(`Route ${routeId} is already active! Please use a different Route ID.`);
            setIsLoading(false);
            return;
          } else {
            console.log(`Route ${routeId} is stale (${Math.round(diffInMinutes)} mins). Overwriting...`);
          }
        }
      } catch (err: unknown) {
        // If offline, we can't check, so we assume it's fine and proceed (optimistic)
        const error = err as { code?: string; message?: string };
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.warn("Offline: Skipping route check.");
        } else {
          throw err;
        }
      }

      // Request Geolocation Permission
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Initial write to Firestore
          await setDoc(routeRef, {
            routeId,
            busNumber,
            driverStatus: 'active',
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            heading: position.coords.heading || 0,
            speed: position.coords.speed || 0,
            lastUpdated: serverTimestamp()
          });

          setIsShiftStarted(true);
          setStatus('Live Tracking');
          setError('');
          startTracking();
          setIsLoading(false);
        },
        (err) => {
          setError(`GPS Error: ${err.message}. Please enable location services.`);
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );

    } catch (err: unknown) {
      console.error("Error starting shift:", err);
      setError('Failed to start shift. Please try again.');
      setIsLoading(false);
    }
  };

  const handleStopShift = async () => {
    if (routeId) {
      try {
        const routeRef = doc(db, 'active_buses', routeId);
        await deleteDoc(routeRef);
      } catch (err) {
        console.error("Error stopping shift:", err);
      }
    }

    setIsShiftStarted(false);
    setStatus('Disconnected');
    setRouteId('');
    setBusNumber('');
    stopTracking();
  };

  const startTracking = () => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, speed: gpsSpeed, heading } = position.coords;
          setSpeed(Math.round((gpsSpeed || 0) * 3.6)); // Convert m/s to km/h
          setStatus('Live Tracking');

          if (routeId) {
            const routeRef = doc(db, 'active_buses', routeId);
            await updateDoc(routeRef, {
              location: { lat: latitude, lng: longitude },
              heading: heading || 0,
              speed: Math.round((gpsSpeed || 0) * 3.6),
              lastUpdated: serverTimestamp()
            });
          }
        },
        (err) => {
          console.error(err);
          setStatus('GPS Error');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsSimulating(false);
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      setIsSimulating(false);
      startTracking(); // Revert to real GPS
    } else {
      stopTracking(); // Stop real GPS
      setIsSimulating(true);
      setStatus('Simulating');

      simulationInterval.current = setInterval(async () => {
        // const start = simulatedRoute[currentSimIndex.current]; // Unused
        const end = simulatedRoute[(currentSimIndex.current + 1) % simulatedRoute.length];

        // Simple interpolation (just jumping for now for simplicity)
        // In a real app, you'd interpolate steps between start and end
        const nextPos = end;

        currentSimIndex.current = (currentSimIndex.current + 1) % simulatedRoute.length;

        if (routeId) {
          const routeRef = doc(db, 'active_buses', routeId);
          await updateDoc(routeRef, {
            location: nextPos,
            heading: 0, // Calculate heading if needed
            speed: 45, // Simulated speed
            lastUpdated: serverTimestamp()
          });
          setSpeed(45);
        }

      }, 3000); // Update every 3 seconds
    }
  };

  const handleReportIssue = async (issue: string) => {
    if (routeId) {
      const routeRef = doc(db, 'active_buses', routeId);
      await updateDoc(routeRef, {
        driverStatus: issue,
        lastUpdated: serverTimestamp()
      });
      alert(`Reported: ${issue}`);
    }
  };

  return (
    <>
      {!isShiftStarted ? (
        <SetupShift
          routeId={routeId}
          setRouteId={setRouteId}
          busNumber={busNumber}
          setBusNumber={setBusNumber}
          onStartShift={handleStartShift}
          error={error}
          isLoading={isLoading}
        />
      ) : (
        <DriverDashboard
          isShiftStarted={isShiftStarted}
          status={status}
          speed={speed}
          onStartShift={handleStartShift}
          onStopShift={handleStopShift}
          onReportIssue={handleReportIssue}
          onToggleSimulation={toggleSimulation}
          isSimulating={isSimulating}
          routeId={routeId}
          busNumber={busNumber}
        />
      )}
    </>
  );
};

export default Driver;
