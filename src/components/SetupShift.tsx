import React from 'react';
import { Bus, Navigation } from 'lucide-react';

interface SetupShiftProps {
    routeId: string;
    setRouteId: (value: string) => void;
    busNumber: string;
    setBusNumber: (value: string) => void;
    onStartShift: () => void;
    error: string;
    isLoading?: boolean;
}

const SetupShift: React.FC<SetupShiftProps> = ({
    routeId,
    setRouteId,
    busNumber,
    setBusNumber,
    onStartShift,
    error,
    isLoading = false,
}) => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-fade-in-up">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="p-8 text-center">
                    <div className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Bus className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Driver Portal</h1>
                    <p className="text-slate-400 text-sm">Initialize your shift to start tracking</p>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Navigation className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={routeId}
                                onChange={(e) => setRouteId(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                placeholder="Route ID (e.g., R-101)"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Bus className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={busNumber}
                                onChange={(e) => setBusNumber(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                placeholder="Bus Number (e.g., UP-16-1234)"
                            />
                        </div>
                    </div>

                    <button
                        onClick={onStartShift}
                        disabled={isLoading}
                        className={`w-full py-4 px-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/25 transform transition-all duration-200 flex items-center justify-center gap-2 group ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98]'}`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Checking Availability...</span>
                            </>
                        ) : (
                            <>
                                <span>Initialize Dashboard</span>
                                <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <span className="text-red-400 font-bold">!</span>
                            </div>
                            <p className="text-sm text-red-300 font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/50 px-8 py-4 border-t border-white/5 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-slate-500 font-medium">
                        GPS Signal Required
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SetupShift;
