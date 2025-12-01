import { useState, useEffect } from 'react';
import { Power, AlertTriangle, Wrench, Fuel, SignalHigh, SignalLow, WifiOff } from 'lucide-react';

interface DriverDashboardProps {
    isShiftStarted: boolean;
    status: string;
    speed?: number; // Optional speed prop
    onStartShift: () => void;
    onStopShift: () => void;
    onReportIssue: (issue: string) => void;
    onToggleSimulation: () => void;
    isSimulating: boolean;
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
    onToggleSimulation,
    isSimulating,
    routeId,
    busNumber
}: DriverDashboardProps) => {
    const [activeIssue, setActiveIssue] = useState('OK');

    const handleIssueReport = (issue: string) => {
        setActiveIssue(issue);
        onReportIssue(issue);
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusIcon = () => {
        if (status === 'Live Tracking') return <SignalHigh className="w-5 h-5 text-green-400" />;
        if (status === 'GPS Error') return <WifiOff className="w-5 h-5 text-red-400" />;
        return <SignalLow className="w-5 h-5 text-yellow-400" />;
    };

    const getStatusColor = () => {
        if (status === 'Live Tracking') return 'bg-green-500';
        if (status === 'GPS Error') return 'bg-red-500';
        return 'bg-yellow-500';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="pt-6 px-6 pb-4 flex justify-between items-end z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                            Active Route
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none drop-shadow-lg">{routeId || 'ROUTE ID'}</h1>
                    <p className="text-slate-400 font-medium text-lg mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        {busNumber || 'BUS NUMBER'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-thin text-white tracking-tighter tabular-nums drop-shadow-md">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-indigo-300 font-bold tracking-[0.2em] uppercase mt-1">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Telemetry Bar (Glassmorphism) */}
            <div className="mx-6 mt-6 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-10">
                <div className="bg-slate-900/40 rounded-[20px] p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-slate-800/50 border border-white/5 shadow-inner`}>
                            {getStatusIcon()}
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">GPS Signal</div>
                            <div className="text-base font-bold text-white flex items-center gap-2">
                                {status}
                                <span className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse shadow-[0_0_12px_currentColor]`}></span>
                            </div>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2"></div>

                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Current Speed</div>
                            <div className="text-3xl font-black text-white leading-none tabular-nums tracking-tight">
                                {speed} <span className="text-sm font-bold text-slate-500 ml-1">km/h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-10 z-10 relative py-8">

                {/* Simulation Toggle (Dev Mode) */}
                {isShiftStarted && (
                    <button
                        onClick={onToggleSimulation}
                        className={`absolute top-0 right-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${isSimulating
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse'
                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        {isSimulating ? 'SIMULATION ACTIVE' : 'ENABLE SIMULATION'}
                    </button>
                )}

                {/* Master Switch */}
                <button
                    onClick={isShiftStarted ? onStopShift : onStartShift}
                    className={`
                        relative w-80 h-80 rounded-full flex flex-col items-center justify-center
                        transition-all duration-500 transform active:scale-95 group
                        ${isShiftStarted
                            ? 'bg-gradient-to-b from-red-900 to-slate-900 shadow-[0_0_80px_rgba(220,38,38,0.3)]'
                            : 'bg-gradient-to-b from-indigo-900 to-slate-900 shadow-[0_0_80px_rgba(79,70,229,0.3)]'
                        }
                    `}
                >
                    {/* Outer Rings */}
                    <div className={`absolute inset-0 rounded-full border border-white/5 ${isShiftStarted ? 'animate-[spin_10s_linear_infinite]' : 'animate-[spin_20s_linear_infinite]'}`} />
                    <div className={`absolute inset-4 rounded-full border border-white/5 ${isShiftStarted ? 'animate-[spin_15s_linear_infinite_reverse]' : 'animate-[spin_25s_linear_infinite_reverse]'}`} />

                    {/* Glowing Ring */}
                    <div className={`absolute inset-0 rounded-full opacity-50 blur-xl transition-colors duration-500 ${isShiftStarted ? 'bg-red-600/20' : 'bg-indigo-600/20'}`} />

                    {/* Button Surface */}
                    <div className={`
                        absolute inset-6 rounded-full flex flex-col items-center justify-center border-4
                        transition-all duration-500 shadow-2xl backdrop-blur-sm
                        ${isShiftStarted
                            ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-900/50 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]'
                            : 'bg-gradient-to-br from-indigo-500 to-indigo-700 border-indigo-800/50 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]'
                        }
                    `}>
                        {isShiftStarted && (
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-40 animate-ping duration-[2000ms]"></div>
                        )}

                        {!isShiftStarted && (
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-30 animate-pulse duration-[3000ms]"></div>
                        )}

                        <Power className={`w-28 h-28 mb-4 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 ${isShiftStarted ? 'text-white' : 'text-white'}`} strokeWidth={1.5} />
                        <span className="text-4xl font-black tracking-widest uppercase text-white drop-shadow-md">
                            {isShiftStarted ? 'STOP' : 'START'}
                        </span>
                        <span className={`text-xs font-bold tracking-[0.3em] uppercase mt-2 opacity-80 ${isShiftStarted ? 'text-red-200' : 'text-indigo-200'}`}>
                            {isShiftStarted ? 'End Shift' : 'Begin Shift'}
                        </span>
                    </div>
                </button>
            </div>

            {/* Emergency / Issue Panel */}
            {isShiftStarted && (
                <div className="p-6 pb-10 z-10 animate-slide-up">
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => handleIssueReport('TRAFFIC')}
                            className={`
                                group relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-300 border
                                ${activeIssue === 'TRAFFIC'
                                    ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_30px_rgba(234,179,8,0.4)] transform -translate-y-1'
                                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10 hover:text-yellow-400'}
                            `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            <AlertTriangle className="w-8 h-8 mb-3 relative z-10" strokeWidth={1.5} />
                            <span className="font-bold text-[10px] tracking-widest relative z-10">TRAFFIC</span>
                        </button>

                        <button
                            onClick={() => handleIssueReport('BREAKDOWN')}
                            className={`
                                group relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-300 border
                                ${activeIssue === 'BREAKDOWN'
                                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] transform -translate-y-1'
                                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10 hover:text-red-400'}
                            `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            <Wrench className="w-8 h-8 mb-3 relative z-10" strokeWidth={1.5} />
                            <span className="font-bold text-[10px] tracking-widest relative z-10">ISSUE</span>
                        </button>

                        <button
                            onClick={() => handleIssueReport('REFUEL')}
                            className={`
                                group relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-300 border
                                ${activeIssue === 'REFUEL'
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transform -translate-y-1'
                                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10 hover:text-blue-400'}
                            `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            <Fuel className="w-8 h-8 mb-3 relative z-10" strokeWidth={1.5} />
                            <span className="font-bold text-[10px] tracking-widest relative z-10">REFUEL</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
