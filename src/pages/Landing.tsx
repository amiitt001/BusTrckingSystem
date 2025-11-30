import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="landing-body">
            <div className="container">
                <h1 className="landing-title">Bus Tracking System</h1>
                <p className="subtitle">Select your role to get started</p>

                <div className="cards-container">
                    <Link to="/driver" className="card">
                        <span className="icon">🚍</span>
                        <h2>Driver App</h2>
                        <p>Broadcast your location and manage your trip status in real-time.</p>
                    </Link>

                    <Link to="/tracker" className="card">
                        <span className="icon">📍</span>
                        <h2>Passenger Tracker</h2>
                        <p>Track buses live on the map and see estimated arrival times.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
