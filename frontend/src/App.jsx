import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar, { MobileNav } from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Academics from './pages/Academics';
import Gym from './pages/Gym';
import Social from './pages/Social';
import Jobs from './pages/Jobs';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

// Notification component
const Notification = () => {
    const { notification } = useApp();

    if (!notification) return null;

    const bgColor = notification.type === 'success'
        ? 'bg-green-500/90'
        : notification.type === 'error'
            ? 'bg-red-500/90'
            : 'bg-purple-500/90';

    return (
        <div className={`fixed top-20 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-bounce-slow`}>
            {notification.message}
        </div>
    );
};

const AppContent = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <Sidebar />
            <MobileNav />
            <Notification />

            <main className="flex-1 pt-20 pb-20 lg:pb-6 lg:pl-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/checkin" element={<CheckIn />} />
                        <Route path="/academics" element={<Academics />} />
                        <Route path="/gym" element={<Gym />} />
                        <Route path="/social" element={<Social />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                    <Footer />
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </Router>
    );
}

export default App;
