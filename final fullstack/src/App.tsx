import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './store/store';
import { heartbeat, randomPriceTick } from './store/marketSlice';
import { Navbar } from './components/Navbar';
import { TelemetryBanner } from './components/TelemetryBanner';
import { MetricsBar } from './components/MetricsBar';
import { PortfolioAnalytics } from './components/PortfolioAnalytics';
import { FilterToolbar } from './components/FilterToolbar';
import { AssetGrid } from './components/AssetGrid';
import { AssetDetailModal } from './components/AssetDetailModal';
import { ProfilerPanel } from './components/ProfilerPanel';
import { CodeArchitectureGuide } from './components/CodeArchitectureGuide';

const DashboardContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isStressTesting, stressFrequencyHz, activeTab, isSimulatingLiveTrades } =
    useAppSelector((state) => state.profiler);

  // Background High-Frequency Noise Generator (Stress Test)
  useEffect(() => {
    if (!isStressTesting) return;
    const intervalMs = Math.max(10, Math.floor(1000 / stressFrequencyHz));
    const intervalId = setInterval(() => {
      dispatch(heartbeat());
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [dispatch, isStressTesting, stressFrequencyHz]);

  // Live Market Trade Simulator (Mutates genuine asset prices)
  useEffect(() => {
    if (!isSimulatingLiveTrades) return;
    const tradeInterval = setInterval(() => {
      dispatch(randomPriceTick());
    }, 1200);

    return () => clearInterval(tradeInterval);
  }, [dispatch, isSimulatingLiveTrades]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <TelemetryBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <MetricsBar />
            <PortfolioAnalytics />
            <FilterToolbar />
            <AssetGrid />
            <AssetDetailModal />
          </div>
        )}

        {activeTab === 'telemetry' && <ProfilerPanel />}

        {activeTab === 'architecture' && <CodeArchitectureGuide />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-medium">StatePulse Terminal</span>
            <span>— Production Blueprint for Optimized Redux Reselect State Access</span>
          </div>
          <div className="text-[11px] font-mono text-slate-600">
            Powered by Redux Toolkit 2.x • Reselect 5.x • React 19 • Vite
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <Provider store={store}>
      <DashboardContent />
    </Provider>
  );
}

export default App;
