import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import Register from './pages/Register';

// Notification component
const Notification = () => {
    const { notification } = useApp();

    if (!notification) return null;

    const bgColor = notification.type === 'success'
        ? 'bg-emerald-500/90'
        : notification.type === 'error'
            ? 'bg-red-500/90'
            : 'bg-sky-500/90';

    return (
        <div className={`fixed top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm text-sm font-medium text-center sm:text-left`}>
            {notification.message}
        </div>
    );
};

// Protected Route - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useApp();

    // Show nothing while loading auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <Header />
            <Sidebar />
            <MobileNav />
            <Notification />
            <main className="flex-1 pt-14 pb-20 md:pb-6 md:pl-56">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                    {children}
                    <Footer />
                </div>
            </main>
        </div>
    );
};

const AppContent = () => {
    return (
        <Routes>
            {/* Auth Routes - No layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* App Routes - Protected with layout */}
            <Route path="/" element={<ProtectedRoute><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/checkin" element={<ProtectedRoute><AuthenticatedLayout><CheckIn /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/academics" element={<ProtectedRoute><AuthenticatedLayout><Academics /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/gym" element={<ProtectedRoute><AuthenticatedLayout><Gym /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><AuthenticatedLayout><Social /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><AuthenticatedLayout><Jobs /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AuthenticatedLayout><Analytics /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AuthenticatedLayout><Admin /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AuthenticatedLayout><Settings /></AuthenticatedLayout></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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

