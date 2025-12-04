import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Jobs = () => {
    const { user, logActivity } = useApp();
    const [applications, setApplications] = useState([
        { id: 1, company: 'Google', role: 'SDE Intern', status: 'applied', date: '2024-12-01' },
        { id: 2, company: 'Microsoft', role: 'SWE Intern', status: 'interview', date: '2024-11-28' },
        { id: 3, company: 'Amazon', role: 'SDE Intern', status: 'rejected', date: '2024-11-25' },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [newApp, setNewApp] = useState({ company: '', role: '', status: 'applied' });

    const addApplication = async (e) => {
        e.preventDefault();
        if (!newApp.company || !newApp.role) return;

        setApplications([
            ...applications,
            { ...newApp, id: Date.now(), date: new Date().toISOString().split('T')[0] }
        ]);
        await logActivity('job');
        setNewApp({ company: '', role: '', status: 'applied' });
        setShowForm(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'interview': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'offer': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const stats = {
        total: applications.length,
        applied: applications.filter(a => a.status === 'applied').length,
        interviews: applications.filter(a => a.status === 'interview').length,
        offers: applications.filter(a => a.status === 'offer').length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">💼 Job Hunt</h1>
                <p className="text-slate-400">Track your job applications and earn XP!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-slate-400">Total Applied</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">{stats.applied}</p>
                    <p className="text-sm text-slate-400">Pending</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">{stats.interviews}</p>
                    <p className="text-sm text-slate-400">Interviews</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{stats.offers}</p>
                    <p className="text-sm text-slate-400">Offers</p>
                </div>
            </div>

            {/* Add Application */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Applications</h3>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        + Add Application
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={addApplication} className="mb-6 p-4 bg-white/5 rounded-xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input
                                type="text"
                                value={newApp.company}
                                onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                                placeholder="Company"
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <input
                                type="text"
                                value={newApp.role}
                                onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                                placeholder="Role"
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <select
                                value={newApp.status}
                                onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="applied">Applied</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-secondary">
                            Save & Earn +15 XP
                        </button>
                    </form>
                )}

                {/* Applications List */}
                <div className="space-y-3">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl">
                                    💼
                                </div>
                                <div>
                                    <p className="text-white font-medium">{app.company}</p>
                                    <p className="text-sm text-slate-400">{app.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500">{app.date}</span>
                                <span className={`px-3 py-1 rounded-full text-xs border capitalize ${getStatusColor(app.status)}`}>
                                    {app.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Jobs;
