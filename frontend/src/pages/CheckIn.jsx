import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// IST helpers
const getISTDateString = () => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const CheckIn = () => {
    const { user, logActivity } = useApp();
    const todayStr = getISTDateString();

    const [dsaTasks, setDsaTasks] = useState([]);
    const [aiTasks, setAiTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);

    const [newDsaTask, setNewDsaTask] = useState('');
    const [newAiTask, setNewAiTask] = useState('');
    const [newOtherTask, setNewOtherTask] = useState('');

    const [dsaDifficulty, setDsaDifficulty] = useState('medium');

    // Load tasks for today
    useEffect(() => {
        const storedDsa = localStorage.getItem(`daily_dsa_${todayStr}`);
        const storedAi = localStorage.getItem(`daily_ai_${todayStr}`);
        const storedOther = localStorage.getItem(`daily_other_${todayStr}`);
        if (storedDsa) setDsaTasks(JSON.parse(storedDsa));
        if (storedAi) setAiTasks(JSON.parse(storedAi));
        if (storedOther) setOtherTasks(JSON.parse(storedOther));
    }, [todayStr]);

    const saveDsaTasks = (tasks) => { setDsaTasks(tasks); localStorage.setItem(`daily_dsa_${todayStr}`, JSON.stringify(tasks)); };
    const saveAiTasks = (tasks) => { setAiTasks(tasks); localStorage.setItem(`daily_ai_${todayStr}`, JSON.stringify(tasks)); };
    const saveOtherTasks = (tasks) => { setOtherTasks(tasks); localStorage.setItem(`daily_other_${todayStr}`, JSON.stringify(tasks)); };

    const addDsaTask = () => {
        if (!newDsaTask.trim()) return;
        saveDsaTasks([...dsaTasks, { id: Date.now(), text: newDsaTask.trim(), difficulty: dsaDifficulty, completed: false }]);
        setNewDsaTask('');
    };

    const addAiTask = () => {
        if (!newAiTask.trim()) return;
        saveAiTasks([...aiTasks, { id: Date.now(), text: newAiTask.trim(), completed: false }]);
        setNewAiTask('');
    };

    const addOtherTask = () => {
        if (!newOtherTask.trim()) return;
        saveOtherTasks([...otherTasks, { id: Date.now(), text: newOtherTask.trim(), completed: false }]);
        setNewOtherTask('');
    };

    const toggleDsaTask = async (id) => {
        const task = dsaTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveDsaTasks(dsaTasks.map(t => t.id === id ? { ...t, completed: true } : t));
        await logActivity('dsa', { difficulty: task.difficulty });
    };

    const toggleAiTask = async (id) => {
        const task = aiTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveAiTasks(aiTasks.map(t => t.id === id ? { ...t, completed: true } : t));
        await logActivity('ai');
    };

    const toggleOtherTask = async (id) => {
        const task = otherTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveOtherTasks(otherTasks.map(t => t.id === id ? { ...t, completed: true } : t));
        await logActivity('personal');
    };

    const deleteDsaTask = (id) => saveDsaTasks(dsaTasks.filter(t => t.id !== id));
    const deleteAiTask = (id) => saveAiTasks(aiTasks.filter(t => t.id !== id));
    const deleteOtherTask = (id) => saveOtherTasks(otherTasks.filter(t => t.id !== id));

    const totalTasks = dsaTasks.length + aiTasks.length + otherTasks.length;
    const completedTasks = dsaTasks.filter(t => t.completed).length + aiTasks.filter(t => t.completed).length + otherTasks.filter(t => t.completed).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getXp = (difficulty) => difficulty === 'easy' ? 10 : difficulty === 'hard' ? 50 : 25;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white mb-1">Daily Check-In</h1>
                    <p className="text-sm text-zinc-500">{formatDate(todayStr)} · IST</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-2xl font-bold font-mono text-amber-400">{user?.streak?.current || 0}</p>
                        <p className="text-[10px] text-zinc-600 uppercase">Streak</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold font-mono text-violet-400">{user?.xp || 0}</p>
                        <p className="text-[10px] text-zinc-600 uppercase">XP</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            {totalTasks > 0 && (
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">{completedTasks}/{totalTasks} completed</span>
                        {progress === 100 && <span className="text-xs font-semibold text-emerald-400">All Done!</span>}
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* DSA & AI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* DSA Box */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        <h3 className="text-base font-semibold text-white">DSA Problems</h3>
                        <span className="text-xs text-zinc-600 ml-auto">{dsaTasks.filter(t => t.completed).length}/{dsaTasks.length}</span>
                    </div>

                    {/* Add DSA Task */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newDsaTask}
                            onChange={(e) => setNewDsaTask(e.target.value)}
                            placeholder="Add problem..."
                            className="input-field flex-1 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addDsaTask()}
                        />
                        <select
                            value={dsaDifficulty}
                            onChange={(e) => setDsaDifficulty(e.target.value)}
                            className="input-field w-20 text-xs"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Med</option>
                            <option value="hard">Hard</option>
                        </select>
                        <button onClick={addDsaTask} className="px-3 py-2 bg-violet-500 text-white rounded-lg text-xs font-semibold hover:bg-violet-600">+</button>
                    </div>

                    {/* DSA Tasks */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {dsaTasks.length === 0 ? (
                            <p className="text-center text-zinc-600 text-sm py-6">No DSA problems added</p>
                        ) : (
                            dsaTasks.map((task) => (
                                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg group ${task.completed ? 'bg-emerald-500/5' : 'bg-[#0a0a0a] hover:bg-[#0d0d0d]'}`}>
                                    <button
                                        onClick={() => toggleDsaTask(task.id)}
                                        disabled={task.completed}
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zinc-700 hover:border-violet-500'}`}
                                    >
                                        {task.completed && '✓'}
                                    </button>
                                    <span className={`flex-1 text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.text}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${task.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                                            task.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' :
                                                'bg-amber-500/15 text-amber-400'
                                        }`}>{task.difficulty === 'medium' ? 'Med' : task.difficulty}</span>
                                    <span className="text-[10px] font-mono text-zinc-600">+{getXp(task.difficulty)}</span>
                                    <button onClick={() => deleteDsaTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-sm">×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Box */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <h3 className="text-base font-semibold text-white">AI/ML Topics</h3>
                        <span className="text-xs text-zinc-600 ml-auto">{aiTasks.filter(t => t.completed).length}/{aiTasks.length}</span>
                    </div>

                    {/* Add AI Task */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newAiTask}
                            onChange={(e) => setNewAiTask(e.target.value)}
                            placeholder="Add topic..."
                            className="input-field flex-1 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addAiTask()}
                        />
                        <button onClick={addAiTask} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">+</button>
                    </div>

                    {/* AI Tasks */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {aiTasks.length === 0 ? (
                            <p className="text-center text-zinc-600 text-sm py-6">No AI topics added</p>
                        ) : (
                            aiTasks.map((task) => (
                                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg group ${task.completed ? 'bg-emerald-500/5' : 'bg-[#0a0a0a] hover:bg-[#0d0d0d]'}`}>
                                    <button
                                        onClick={() => toggleAiTask(task.id)}
                                        disabled={task.completed}
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zinc-700 hover:border-emerald-500'}`}
                                    >
                                        {task.completed && '✓'}
                                    </button>
                                    <span className={`flex-1 text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.text}</span>
                                    <span className="text-[10px] font-mono text-zinc-600">+30</span>
                                    <button onClick={() => deleteAiTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-sm">×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Other Tasks Box */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <h3 className="text-base font-semibold text-white">Other Tasks</h3>
                    <span className="text-xs text-zinc-500 ml-1">Gym, Goals, Personal...</span>
                    <span className="text-xs text-zinc-600 ml-auto">{otherTasks.filter(t => t.completed).length}/{otherTasks.length}</span>
                </div>

                {/* Add Other Task */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newOtherTask}
                        onChange={(e) => setNewOtherTask(e.target.value)}
                        placeholder="Add task..."
                        className="input-field flex-1 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addOtherTask()}
                    />
                    <button onClick={addOtherTask} className="px-3 py-2 bg-pink-500 text-white rounded-lg text-xs font-semibold hover:bg-pink-600">+</button>
                </div>

                {/* Other Tasks */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {otherTasks.length === 0 ? (
                        <p className="text-center text-zinc-600 text-sm py-6">No other tasks added</p>
                    ) : (
                        otherTasks.map((task) => (
                            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg group ${task.completed ? 'bg-emerald-500/5' : 'bg-[#0a0a0a] hover:bg-[#0d0d0d]'}`}>
                                <button
                                    onClick={() => toggleOtherTask(task.id)}
                                    disabled={task.completed}
                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zinc-700 hover:border-pink-500'}`}
                                >
                                    {task.completed && '✓'}
                                </button>
                                <span className={`flex-1 text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.text}</span>
                                <span className="text-[10px] font-mono text-zinc-600">+10</span>
                                <button onClick={() => deleteOtherTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-sm">×</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
