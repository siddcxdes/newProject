import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Jobs = () => {
    const { logActivity, user } = useApp();
    const [applications, setApplications] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', role: '', status: 'applied' });

    const handleAddApplication = () => {
        if (!newJob.company || !newJob.role) return;
        const app = { id: Date.now(), ...newJob, date: new Date().toISOString() };
        setApplications([app, ...applications]);
        logActivity('job');
        setNewJob({ company: '', role: '', status: 'applied' });
        setShowAddForm(false);
    };

    const updateStatus = (id, status) => {
        setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
    };

    const deleteApplication = (id) => {
        setApplications(applications.filter(app => app.id !== id));
    };

    const statuses = [
        { value: 'applied', label: 'Applied', color: 'bg-blue-500' },
        { value: 'screening', label: 'Screening', color: 'bg-amber-500' },
        { value: 'interview', label: 'Interview', color: 'bg-violet-500' },
        { value: 'offer', label: 'Offer', color: 'bg-emerald-500' },
        { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
    ];

    const getStatusColor = (status) => {
        return statuses.find(s => s.value === status)?.color || 'bg-zinc-500';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white mb-1">Job Search</h1>
                    <p className="text-sm text-zinc-500">Track your applications and interview progress</p>
                </div>
                <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">+ Log Application</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statuses.map((status) => {
                    const count = applications.filter(a => a.status === status.value).length;
                    return (
                        <div key={status.value} className="glass-card p-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${status.color} mb-2`}></div>
                            <p className="stat-value text-xl">{count}</p>
                            <p className="stat-label text-[10px]">{status.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Total Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Total Applied</p>
                    <p className="stat-value text-blue-400">{user?.stats?.jobApplications || 0}</p>
                    <p className="stat-sublabel">all time</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">This Session</p>
                    <p className="stat-value">{applications.length}</p>
                    <p className="stat-sublabel">tracked</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Interview Rate</p>
                    <p className="stat-value text-violet-400">{applications.length > 0 ? Math.round((applications.filter(a => ['interview', 'offer'].includes(a.status)).length / applications.length) * 100) : 0}%</p>
                    <p className="stat-sublabel">conversion</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Success Rate</p>
                    <p className="stat-value text-emerald-400">{applications.length > 0 ? Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100) : 0}%</p>
                    <p className="stat-sublabel">offers</p>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="glass-card p-5 space-y-4">
                    <h3 className="text-base font-semibold text-white">New Application</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} placeholder="Company name" className="input-field" />
                        <input type="text" value={newJob.role} onChange={(e) => setNewJob({ ...newJob, role: e.target.value })} placeholder="Role / Position" className="input-field" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAddApplication} className="btn-primary text-sm">Add Application +15 XP</button>
                        <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* Applications List */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Applications</h3>
                {applications.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-500 mb-2">No applications tracked yet</p>
                        <p className="text-xs text-zinc-600">Start by logging your first application above</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {applications.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#111111] hover:border-[#1a1a1a] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(app.status)}`}></div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{app.company}</p>
                                        <p className="text-xs text-zinc-500">{app.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={app.status}
                                        onChange={(e) => updateStatus(app.id, e.target.value)}
                                        className="bg-[#111111] text-white text-xs font-medium px-3 py-2 rounded-lg border border-[#1a1a1a] focus:outline-none focus:border-[#333]"
                                    >
                                        {statuses.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => deleteApplication(app.id)} className="opacity-0 group-hover:opacity-100 text-xs text-zinc-600 hover:text-red-400 font-medium transition-all">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Log */}
            <button onClick={() => logActivity('job')} className="w-full glass-card-hover p-5 text-center">
                <p className="text-sm font-semibold text-white mb-1">Quick Log Application</p>
                <p className="text-xs text-zinc-500">Log without tracking details</p>
                <p className="text-sm font-semibold font-mono text-emerald-400 mt-2">+15 XP</p>
            </button>
        </div>
    );
};

export default Jobs;
