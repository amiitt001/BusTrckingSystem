import { useState } from 'react';
import { Power, AlertTriangle, Wrench, Fuel, Signal, SignalHigh, SignalLow, WifiOff } from 'lucide-react';

interface DriverDashboardProps {
    isShiftStarted: boolean;
    status: string;
    speed?: number; // Optional speed prop
    onStartShift: () => void;
    onStopShift: () => void;
    onReportIssue: (issue: string) => void;
    routeId: string;
    busNumber: string;
}

const DriverDashboard = ({
    isShiftStarted,
    status,
    speed = 0,
    onStartShift,
    onStopShift,
    onReportIssue,
    routeId,
    busNumber
}: DriverDashboardProps) => {
    const [activeIssue, setActiveIssue] = useState('OK');

    const handleIssueReport = (issue: string) => {
        setActiveIssue(issue);
        onReportIssue(issue);
    };

    const getStatusIcon = () => {
        if (status === 'Live Tracking') return <SignalHigh className="w-6 h-6 text-green-500" />;
        if (status === 'GPS Error') return <WifiOff className="w-6 h-6 text-red-500" />;
        return <SignalLow className="w-6 h-6 text-yellow-500" />;
    };

    const getStatusColor = () => {
        if (status === 'Live Tracking') return 'bg-green-500';
        if (status === 'GPS Error') return 'bg-red-500';
        return 'bg-yellow-500';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 font-sans">
            {/* Header / Status HUD */}
            <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-slate-300">{routeId || 'NO ROUTE'}</h2>
                    <p className="text-sm text-slate-400">{busNumber || 'NO BUS'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Status</div>
                        <div className="font-bold flex items-center gap-2">
                            {status}
                            <span className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></span>
                        </div>
                    </div>
                    <div className="bg-slate-700 p-2 rounded-lg">
                        {getStatusIcon()}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8">

                {/* Speed / Distance Display */}
                {isShiftStarted && (
                    <div className="text-center">
                        <div className="text-6xl font-black tracking-tighter text-slate-100">
                            {speed}
                            <span className="text-2xl font-medium text-slate-500 ml-2">km/h</span>
                        </div>
                    </div>
                )}

                {/* Master Switch */}
                <button
                    onClick={isShiftStarted ? onStopShift : onStartShift}
                    className={`
            relative w-64 h-64 rounded-full flex flex-col items-center justify-center
            transition-all duration-300 transform active:scale-95 shadow-2xl
            ${isShiftStarted
                            ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-900 shadow-[0_0_50px_rgba(220,38,38,0.5)]'
                            : 'bg-green-600 hover:bg-green-700 ring-4 ring-green-900 shadow-[0_0_50px_rgba(22,163,74,0.3)] animate-pulse'
                        }
          `}
                >
                    {isShiftStarted && (
                        <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-50 animate-ping"></div>
                    )}

                    <Power className="w-20 h-20 mb-2" />
                    <span className="text-2xl font-black tracking-widest uppercase">
                        {isShiftStarted ? 'STOP SHIFT' : 'START SHIFT'}
                    </span>
                </button>
            </div>

            {/* Emergency / Issue Panel */}
            {isShiftStarted && (
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleIssueReport('TRAFFIC')}
                        className={`
              flex flex-col items-center justify-center p-4 rounded-xl transition-all
              ${activeIssue === 'TRAFFIC' ? 'bg-yellow-500 text-black ring-2 ring-yellow-300' : 'bg-slate-800 text-yellow-500 hover:bg-slate-700'}
            `}
                    >
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <span className="font-bold text-sm">TRAFFIC</span>
                    </button>

                    <button
                        onClick={() => handleIssueReport('BREAKDOWN')}
                        className={`
              flex flex-col items-center justify-center p-4 rounded-xl transition-all
              ${activeIssue === 'BREAKDOWN' ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-slate-800 text-red-500 hover:bg-slate-700'}
            `}
                    >
                        <Wrench className="w-8 h-8 mb-2" />
                        <span className="font-bold text-sm">ISSUE</span>
                    </button>

                    <button
                        onClick={() => handleIssueReport('REFUEL')}
                        className={`
              flex flex-col items-center justify-center p-4 rounded-xl transition-all
              ${activeIssue === 'REFUEL' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-800 text-blue-500 hover:bg-slate-700'}
            `}
                    >
                        <Fuel className="w-8 h-8 mb-2" />
                        <span className="font-bold text-sm">REFUEL</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
