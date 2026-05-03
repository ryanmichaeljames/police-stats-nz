import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Overview from './pages/Overview';
import Victimisations from './pages/Victimisations';
import Offenders from './pages/Offenders';
import FamilyViolence from './pages/FamilyViolence';
import Demand from './pages/Demand';
import Deportees from './pages/Deportees';
import ProfessionalConduct from './pages/ProfessionalConduct';
import DataExplorer from './pages/DataExplorer';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <div className="bg-amber-50 border-b-2 border-amber-400 px-4 py-2 text-center text-sm text-amber-900">
          <span className="font-semibold">⚠️ Work in progress.</span> Data on this site may be incomplete or inaccurate. Do not rely on any figures shown here for official, legal, or research purposes.
        </div>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/victimisations" element={<Victimisations />} />
            <Route path="/offenders" element={<Offenders />} />
            <Route path="/family-violence" element={<FamilyViolence />} />
            <Route path="/demand" element={<Demand />} />
            <Route path="/deportees" element={<Deportees />} />
            <Route path="/conduct" element={<ProfessionalConduct />} />
            <Route path="/data-explorer" element={<DataExplorer />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
