import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Academics = () => {
    const {
        dsaTopics, aiModules, logActivity,
        addDsaTopic, editDsaTopic, deleteDsaTopic, addDsaSubtopic, toggleDsaSubtopic, deleteDsaSubtopic,
        addAiModule, editAiModule, deleteAiModule, addAiLesson, toggleAiLesson, completeAiModule
    } = useApp();

    const [activeSection, setActiveSection] = useState('dsa');
    const [expandedDsaTopic, setExpandedDsaTopic] = useState(null);
    const [expandedAiModule, setExpandedAiModule] = useState(null);
    const [showAddDsaTopic, setShowAddDsaTopic] = useState(false);
    const [showAddAiModule, setShowAddAiModule] = useState(false);
    const [newDsaTopicName, setNewDsaTopicName] = useState('');
    const [newAiModuleName, setNewAiModuleName] = useState('');
    const [showAddProblem, setShowAddProblem] = useState(null);
    const [showAddLesson, setShowAddLesson] = useState(null);
    const [newProblemName, setNewProblemName] = useState('');
    const [newProblemDifficulty, setNewProblemDifficulty] = useState('medium');
    const [newLessonName, setNewLessonName] = useState('');
    const [editingTopic, setEditingTopic] = useState(null);
    const [editingModule, setEditingModule] = useState(null);

    // Stats
    const totalDsaProblems = dsaTopics.reduce((sum, t) => sum + t.subtopics.length, 0);
    const totalDsaSolved = dsaTopics.reduce((sum, t) => sum + t.completed, 0);
    const dsaProgress = totalDsaProblems > 0 ? Math.round((totalDsaSolved / totalDsaProblems) * 100) : 0;

    const totalAiLessons = aiModules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedAiLessons = aiModules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
    const totalAiCompleted = aiModules.filter(m => m.completed).length;
    const aiProgress = totalAiLessons > 0 ? Math.round((completedAiLessons / totalAiLessons) * 100) : 0;

    const handleAddDsaTopic = () => {
        if (!newDsaTopicName.trim()) return;
        addDsaTopic(newDsaTopicName.trim());
        setNewDsaTopicName('');
        setShowAddDsaTopic(false);
    };

    const handleAddAiModule = () => {
        if (!newAiModuleName.trim()) return;
        addAiModule(newAiModuleName.trim());
        setNewAiModuleName('');
        setShowAddAiModule(false);
    };

    const handleAddProblem = (topicId) => {
        if (!newProblemName.trim()) return;
        addDsaSubtopic(topicId, newProblemName.trim(), newProblemDifficulty);
        setNewProblemName('');
        setNewProblemDifficulty('medium');
        setShowAddProblem(null);
    };

    const handleAddLesson = (moduleId) => {
        if (!newLessonName.trim()) return;
        addAiLesson(moduleId, newLessonName.trim());
        setNewLessonName('');
        setShowAddLesson(null);
    };

    const difficultyConfig = {
        easy: { label: 'Easy', color: 'emerald', xp: 10 },
        medium: { label: 'Medium', color: 'amber', xp: 25 },
        hard: { label: 'Hard', color: 'red', xp: 50 }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white mb-1">Academics</h1>
                    <p className="text-sm text-zinc-500">Master DSA and AI/ML through structured learning</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => logActivity('dsa', { difficulty: 'medium' })} className="btn-secondary text-xs">
                        Quick DSA +25
                    </button>
                    <button onClick={() => logActivity('ai')} className="btn-primary text-xs">
                        Quick AI +30
                    </button>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DSA Progress Card */}
                <div
                    className={`glass-card p-5 cursor-pointer transition-all ${activeSection === 'dsa' ? 'ring-2 ring-violet-500/50' : 'hover:border-[#222]'}`}
                    onClick={() => setActiveSection('dsa')}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                <h3 className="text-sm font-semibold text-white">Data Structures & Algorithms</h3>
                            </div>
                            <p className="text-xs text-zinc-500">{dsaTopics.length} topics · {totalDsaProblems} problems</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold font-mono text-violet-400">{totalDsaSolved}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Solved</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500" style={{ width: `${dsaProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-zinc-500">{dsaProgress}% complete</span>
                            <span className="text-xs text-zinc-600">{totalDsaProblems - totalDsaSolved} remaining</span>
                        </div>
                    </div>
                </div>

                {/* AI/ML Progress Card */}
                <div
                    className={`glass-card p-5 cursor-pointer transition-all ${activeSection === 'ai' ? 'ring-2 ring-emerald-500/50' : 'hover:border-[#222]'}`}
                    onClick={() => setActiveSection('ai')}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <h3 className="text-sm font-semibold text-white">AI & Machine Learning</h3>
                            </div>
                            <p className="text-xs text-zinc-500">{aiModules.length} modules · {totalAiLessons} lessons</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold font-mono text-emerald-400">{totalAiCompleted}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Completed</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${aiProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-zinc-500">{aiProgress}% complete</span>
                            <span className="text-xs text-zinc-600">{aiModules.length - totalAiCompleted} modules left</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DSA Section */}
            {activeSection === 'dsa' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">DSA Topics</h2>
                        <button onClick={() => setShowAddDsaTopic(true)} className="btn-secondary text-xs">+ New Topic</button>
                    </div>

                    {showAddDsaTopic && (
                        <div className="glass-card p-4 flex gap-3">
                            <input
                                type="text"
                                value={newDsaTopicName}
                                onChange={(e) => setNewDsaTopicName(e.target.value)}
                                placeholder="Enter topic name (e.g., Binary Search, Graphs)"
                                className="input-field flex-1"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDsaTopic()}
                            />
                            <button onClick={handleAddDsaTopic} className="btn-primary text-xs">Add</button>
                            <button onClick={() => { setShowAddDsaTopic(false); setNewDsaTopicName(''); }} className="btn-secondary text-xs">Cancel</button>
                        </div>
                    )}

                    {dsaTopics.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-white font-medium mb-1">No DSA topics yet</p>
                            <p className="text-sm text-zinc-500 mb-4">Create your first topic to start tracking problems</p>
                            <button onClick={() => setShowAddDsaTopic(true)} className="btn-primary text-sm">Create First Topic</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dsaTopics.map((topic) => (
                                <div key={topic.id} className="glass-card overflow-hidden">
                                    {/* Topic Header */}
                                    <div
                                        className="p-4 cursor-pointer hover:bg-[#0d0d0d] transition-all"
                                        onClick={() => setExpandedDsaTopic(expandedDsaTopic === topic.id ? null : topic.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${topic.completed === topic.total && topic.total > 0
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-[#111] text-white'
                                                    }`}>
                                                    {topic.completed === topic.total && topic.total > 0 ? '✓' : topic.completed}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {editingTopic === topic.id ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={topic.name}
                                                        className="bg-[#111] px-3 py-1.5 rounded-lg text-white text-sm font-semibold w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onBlur={(e) => { editDsaTopic(topic.id, { name: e.target.value }); setEditingTopic(null); }}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { editDsaTopic(topic.id, { name: e.target.value }); setEditingTopic(null); } }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <h4 className="text-sm font-semibold text-white truncate">{topic.name}</h4>
                                                )}
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-zinc-500">{topic.subtopics.length} problems</span>
                                                    <div className="flex-1 max-w-32">
                                                        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${topic.total > 0 ? (topic.completed / topic.total) * 100 : 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono text-violet-400">{topic.total > 0 ? Math.round((topic.completed / topic.total) * 100) : 0}%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => setEditingTopic(topic.id)} className="p-2 text-zinc-600 hover:text-white hover:bg-[#111] rounded-lg transition-all">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => deleteDsaTopic(topic.id)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                            <svg className={`w-5 h-5 text-zinc-500 transition-transform ${expandedDsaTopic === topic.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedDsaTopic === topic.id && (
                                        <div className="border-t border-[#111] bg-black p-4">
                                            {/* Add Problem */}
                                            {showAddProblem === topic.id ? (
                                                <div className="flex gap-2 mb-4">
                                                    <input
                                                        type="text"
                                                        value={newProblemName}
                                                        onChange={(e) => setNewProblemName(e.target.value)}
                                                        placeholder="Problem name"
                                                        className="input-field flex-1 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddProblem(topic.id)}
                                                    />
                                                    <select
                                                        value={newProblemDifficulty}
                                                        onChange={(e) => setNewProblemDifficulty(e.target.value)}
                                                        className="input-field w-24 text-sm"
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                    <button onClick={() => handleAddProblem(topic.id)} className="px-4 py-2 bg-violet-500 text-white rounded-lg text-xs font-semibold hover:bg-violet-600 transition-all">Add</button>
                                                    <button onClick={() => setShowAddProblem(null)} className="px-3 py-2 text-zinc-500 hover:text-white text-sm">×</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowAddProblem(topic.id)}
                                                    className="w-full py-3 border border-dashed border-[#222] rounded-xl text-zinc-500 hover:border-violet-500/50 hover:text-violet-400 text-sm font-medium transition-all mb-4"
                                                >
                                                    + Add Problem
                                                </button>
                                            )}

                                            {/* Problems List */}
                                            {topic.subtopics.length === 0 ? (
                                                <p className="text-center text-zinc-600 text-sm py-4">No problems added yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {topic.subtopics.map((problem) => {
                                                        const config = difficultyConfig[problem.difficulty] || difficultyConfig.medium;
                                                        return (
                                                            <div key={problem.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${problem.completed ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-[#0a0a0a] hover:bg-[#0d0d0d] border border-transparent'}`}>
                                                                <button
                                                                    onClick={() => toggleDsaSubtopic(topic.id, problem.id)}
                                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${problem.completed
                                                                            ? 'bg-emerald-500 text-white'
                                                                            : 'border-2 border-zinc-700 hover:border-violet-500 hover:bg-violet-500/10'
                                                                        }`}
                                                                >
                                                                    {problem.completed && '✓'}
                                                                </button>
                                                                <span className={`flex-1 text-sm ${problem.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                                                    {problem.name}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${config.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                                                                        config.color === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                                                                            'bg-red-500/15 text-red-400'
                                                                    }`}>
                                                                    {config.label}
                                                                </span>
                                                                <span className="text-xs font-mono text-zinc-500">+{config.xp}</span>
                                                                <button
                                                                    onClick={() => deleteDsaSubtopic(topic.id, problem.id)}
                                                                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* AI/ML Section */}
            {activeSection === 'ai' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">AI/ML Modules</h2>
                        <button onClick={() => setShowAddAiModule(true)} className="btn-secondary text-xs">+ New Module</button>
                    </div>

                    {showAddAiModule && (
                        <div className="glass-card p-4 flex gap-3">
                            <input
                                type="text"
                                value={newAiModuleName}
                                onChange={(e) => setNewAiModuleName(e.target.value)}
                                placeholder="Enter module name (e.g., Neural Networks, Transformers)"
                                className="input-field flex-1"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAiModule()}
                            />
                            <button onClick={handleAddAiModule} className="btn-primary text-xs">Add</button>
                            <button onClick={() => { setShowAddAiModule(false); setNewAiModuleName(''); }} className="btn-secondary text-xs">Cancel</button>
                        </div>
                    )}

                    {aiModules.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <p className="text-white font-medium mb-1">No AI modules yet</p>
                            <p className="text-sm text-zinc-500 mb-4">Create your first module to track AI/ML learning</p>
                            <button onClick={() => setShowAddAiModule(true)} className="btn-primary text-sm">Create First Module</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {aiModules.map((module) => (
                                <div key={module.id} className={`glass-card overflow-hidden transition-all ${module.completed ? 'ring-1 ring-emerald-500/30' : ''}`}>
                                    {/* Module Header */}
                                    <div
                                        className="p-4 cursor-pointer hover:bg-[#0d0d0d] transition-all"
                                        onClick={() => setExpandedAiModule(expandedAiModule === module.id ? null : module.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${module.completed ? 'bg-emerald-500/20' : 'bg-[#111]'
                                                }`}>
                                                {module.completed ? (
                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <span className="text-sm font-bold text-white">{module.progress}%</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {editingModule === module.id ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={module.name}
                                                        className="bg-[#111] px-3 py-1.5 rounded-lg text-white text-sm font-semibold w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onBlur={(e) => { editAiModule(module.id, { name: e.target.value }); setEditingModule(null); }}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { editAiModule(module.id, { name: e.target.value }); setEditingModule(null); } }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <h4 className={`text-sm font-semibold truncate ${module.completed ? 'text-emerald-400' : 'text-white'}`}>{module.name}</h4>
                                                )}
                                                <p className="text-xs text-zinc-500 mt-0.5">{module.lessons.filter(l => l.completed).length}/{module.lessons.length} lessons</p>
                                            </div>
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => setEditingModule(module.id)} className="p-1.5 text-zinc-600 hover:text-white hover:bg-[#111] rounded-lg transition-all">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => deleteAiModule(module.id)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${module.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedAiModule === module.id && (
                                        <div className="border-t border-[#111] bg-black p-4">
                                            {/* Complete Module Button */}
                                            {!module.completed && (
                                                <button
                                                    onClick={() => completeAiModule(module.id)}
                                                    className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold transition-all mb-4"
                                                >
                                                    Mark Module Complete +30 XP
                                                </button>
                                            )}

                                            {/* Add Lesson */}
                                            {showAddLesson === module.id ? (
                                                <div className="flex gap-2 mb-4">
                                                    <input
                                                        type="text"
                                                        value={newLessonName}
                                                        onChange={(e) => setNewLessonName(e.target.value)}
                                                        placeholder="Lesson name"
                                                        className="input-field flex-1 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(module.id)}
                                                    />
                                                    <button onClick={() => handleAddLesson(module.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-all">Add</button>
                                                    <button onClick={() => setShowAddLesson(null)} className="px-3 py-2 text-zinc-500 hover:text-white text-sm">×</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowAddLesson(module.id)}
                                                    className="w-full py-3 border border-dashed border-[#222] rounded-xl text-zinc-500 hover:border-emerald-500/50 hover:text-emerald-400 text-sm font-medium transition-all mb-4"
                                                >
                                                    + Add Lesson
                                                </button>
                                            )}

                                            {/* Lessons List */}
                                            {module.lessons.length === 0 ? (
                                                <p className="text-center text-zinc-600 text-sm py-4">No lessons added yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {module.lessons.map((lesson) => (
                                                        <div key={lesson.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${lesson.completed ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-[#0a0a0a] hover:bg-[#0d0d0d] border border-transparent'}`}>
                                                            <button
                                                                onClick={() => toggleAiLesson(module.id, lesson.id)}
                                                                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${lesson.completed
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : 'border-2 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10'
                                                                    }`}
                                                            >
                                                                {lesson.completed && '✓'}
                                                            </button>
                                                            <span className={`flex-1 text-sm ${lesson.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                                                {lesson.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Academics;
