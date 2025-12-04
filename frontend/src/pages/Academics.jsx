import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Academics = () => {
    const {
        user, dsaTopics, aiModules, logActivity,
        addDsaTopic, editDsaTopic, deleteDsaTopic, addDsaSubtopic, toggleDsaSubtopic, deleteDsaSubtopic,
        addAiModule, editAiModule, deleteAiModule, addAiLesson, toggleAiLesson, completeAiModule
    } = useApp();

    // UI State
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

    // Calculate totals
    const totalDsaSolved = dsaTopics.reduce((sum, t) => sum + t.completed, 0);
    const totalAiCompleted = aiModules.filter(m => m.completed).length;
    const overallAiProgress = aiModules.length > 0
        ? Math.round(aiModules.reduce((sum, m) => sum + m.progress, 0) / aiModules.length)
        : 0;

    // Add DSA Topic
    const handleAddDsaTopic = () => {
        if (!newDsaTopicName.trim()) return;
        addDsaTopic(newDsaTopicName.trim());
        setNewDsaTopicName('');
        setShowAddDsaTopic(false);
    };

    // Add AI Module
    const handleAddAiModule = () => {
        if (!newAiModuleName.trim()) return;
        addAiModule(newAiModuleName.trim());
        setNewAiModuleName('');
        setShowAddAiModule(false);
    };

    // Add Problem
    const handleAddProblem = (topicId) => {
        if (!newProblemName.trim()) return;
        addDsaSubtopic(topicId, newProblemName.trim(), newProblemDifficulty);
        setNewProblemName('');
        setNewProblemDifficulty('medium');
        setShowAddProblem(null);
    };

    // Add Lesson
    const handleAddLesson = (moduleId) => {
        if (!newLessonName.trim()) return;
        addAiLesson(moduleId, newLessonName.trim());
        setNewLessonName('');
        setShowAddLesson(null);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">📚 Academics</h1>
                <p className="text-slate-400">Track your DSA and AI/ML learning progress</p>
            </div>

            {/* DSA Problems Section */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            💻 DSA Problems
                        </h3>
                        <p className="text-slate-400">Total Solved: {totalDsaSolved}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddDsaTopic(true)}
                            className="btn-secondary text-sm"
                        >
                            + Add Topic
                        </button>
                        <button
                            onClick={() => logActivity('dsa', { difficulty: 'medium' })}
                            className="btn-primary text-sm"
                        >
                            Log Problem +25 XP
                        </button>
                    </div>
                </div>

                {/* Add Topic Form */}
                {showAddDsaTopic && (
                    <div className="mb-4 p-4 bg-white/5 rounded-xl flex gap-3">
                        <input
                            type="text"
                            value={newDsaTopicName}
                            onChange={(e) => setNewDsaTopicName(e.target.value)}
                            placeholder="Topic name (e.g., Heap, Trie)"
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddDsaTopic()}
                        />
                        <button onClick={handleAddDsaTopic} className="btn-primary text-sm">Add</button>
                        <button onClick={() => setShowAddDsaTopic(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                )}

                {/* Topics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dsaTopics.map((topic) => (
                        <div key={topic.id} className="bg-white/5 rounded-xl overflow-hidden">
                            {/* Topic Header */}
                            <div
                                className={`p-4 cursor-pointer hover:bg-white/5 transition-all ${expandedDsaTopic === topic.id ? 'bg-purple-500/10' : ''
                                    }`}
                                onClick={() => setExpandedDsaTopic(expandedDsaTopic === topic.id ? null : topic.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{topic.icon}</span>
                                        {editingTopic === topic.id ? (
                                            <input
                                                type="text"
                                                defaultValue={topic.name}
                                                className="bg-white/10 px-2 py-1 rounded text-white text-sm"
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={(e) => {
                                                    editDsaTopic(topic.id, { name: e.target.value });
                                                    setEditingTopic(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        editDsaTopic(topic.id, { name: e.target.value });
                                                        setEditingTopic(null);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-white font-medium">{topic.name}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setEditingTopic(topic.id)}
                                            className="p-1 text-slate-500 hover:text-purple-400"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => deleteDsaTopic(topic.id)}
                                            className="p-1 text-slate-500 hover:text-red-400"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="progress-bar mb-2">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${topic.total > 0 ? (topic.completed / topic.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400">{topic.completed}/{topic.total} problems</p>
                                    <span className="text-xs text-purple-400">
                                        {expandedDsaTopic === topic.id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Subtopics */}
                            {expandedDsaTopic === topic.id && (
                                <div className="border-t border-white/10 p-4 space-y-2 bg-black/20">
                                    {/* Add Problem */}
                                    {showAddProblem === topic.id ? (
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newProblemName}
                                                onChange={(e) => setNewProblemName(e.target.value)}
                                                placeholder="Problem name"
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddProblem(topic.id)}
                                            />
                                            <select
                                                value={newProblemDifficulty}
                                                onChange={(e) => setNewProblemDifficulty(e.target.value)}
                                                className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                            <button onClick={() => handleAddProblem(topic.id)} className="text-green-400 hover:text-green-300">✓</button>
                                            <button onClick={() => setShowAddProblem(null)} className="text-slate-400 hover:text-slate-300">✕</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowAddProblem(topic.id)}
                                            className="w-full py-2 border border-dashed border-white/20 rounded-lg text-slate-400 hover:border-purple-500 hover:text-purple-400 text-sm transition-all"
                                        >
                                            + Add Problem
                                        </button>
                                    )}

                                    {/* Problems List */}
                                    {topic.subtopics.length === 0 ? (
                                        <p className="text-center text-slate-500 text-sm py-2">No problems added yet</p>
                                    ) : (
                                        topic.subtopics.map((problem) => (
                                            <div
                                                key={problem.id}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${problem.completed ? 'bg-green-500/10' : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => toggleDsaSubtopic(topic.id, problem.id)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${problem.completed
                                                            ? 'bg-green-500 text-white text-xs'
                                                            : 'border border-slate-500 hover:border-purple-500'
                                                        }`}
                                                >
                                                    {problem.completed && '✓'}
                                                </button>
                                                <span className={`flex-1 text-sm ${problem.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                                    {problem.name}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                                <button
                                                    onClick={() => deleteDsaSubtopic(topic.id, problem.id)}
                                                    className="text-slate-500 hover:text-red-400 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* AI/ML Progress Section */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white">🤖 AI/ML Progress</h3>
                        <p className="text-slate-400">
                            {totalAiCompleted} modules completed • {overallAiProgress}% overall
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddAiModule(true)}
                            className="btn-secondary text-sm"
                        >
                            + Add Module
                        </button>
                        <button
                            onClick={() => logActivity('ai')}
                            className="btn-primary text-sm"
                        >
                            Complete Module +30 XP
                        </button>
                    </div>
                </div>

                {/* Add Module Form */}
                {showAddAiModule && (
                    <div className="mb-4 p-4 bg-white/5 rounded-xl flex gap-3">
                        <input
                            type="text"
                            value={newAiModuleName}
                            onChange={(e) => setNewAiModuleName(e.target.value)}
                            placeholder="Module name (e.g., Transformers, GANs)"
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAiModule()}
                        />
                        <button onClick={handleAddAiModule} className="btn-primary text-sm">Add</button>
                        <button onClick={() => setShowAddAiModule(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                )}

                {/* Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiModules.map((module) => (
                        <div
                            key={module.id}
                            className={`rounded-xl overflow-hidden border-2 transition-all ${module.completed
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            {/* Module Header */}
                            <div
                                className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                                onClick={() => setExpandedAiModule(expandedAiModule === module.id ? null : module.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">{module.icon}</span>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        {module.completed && <span className="text-green-400">✓</span>}
                                        <button
                                            onClick={() => setEditingModule(module.id)}
                                            className="p-1 text-slate-500 hover:text-purple-400"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => deleteAiModule(module.id)}
                                            className="p-1 text-slate-500 hover:text-red-400"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {editingModule === module.id ? (
                                    <input
                                        type="text"
                                        defaultValue={module.name}
                                        className="w-full bg-white/10 px-2 py-1 rounded text-white text-sm mb-2"
                                        onClick={(e) => e.stopPropagation()}
                                        onBlur={(e) => {
                                            editAiModule(module.id, { name: e.target.value });
                                            setEditingModule(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                editAiModule(module.id, { name: e.target.value });
                                                setEditingModule(null);
                                            }
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    <p className={`font-medium ${module.completed ? 'text-green-400' : 'text-white'}`}>
                                        {module.name}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex-1 progress-bar h-1 mr-2">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                            style={{ width: `${module.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-slate-400">{module.progress}%</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {module.lessons.filter(l => l.completed).length}/{module.lessons.length} lessons
                                </p>
                            </div>

                            {/* Expanded Lessons */}
                            {expandedAiModule === module.id && (
                                <div className="border-t border-white/10 p-4 space-y-2 bg-black/20">
                                    {/* Mark Complete Button */}
                                    {!module.completed && (
                                        <button
                                            onClick={() => completeAiModule(module.id)}
                                            className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all"
                                        >
                                            ✓ Mark Module Complete (+30 XP)
                                        </button>
                                    )}

                                    {/* Add Lesson */}
                                    {showAddLesson === module.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newLessonName}
                                                onChange={(e) => setNewLessonName(e.target.value)}
                                                placeholder="Lesson name"
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(module.id)}
                                            />
                                            <button onClick={() => handleAddLesson(module.id)} className="text-green-400 hover:text-green-300">✓</button>
                                            <button onClick={() => setShowAddLesson(null)} className="text-slate-400 hover:text-slate-300">✕</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowAddLesson(module.id)}
                                            className="w-full py-2 border border-dashed border-white/20 rounded-lg text-slate-400 hover:border-purple-500 hover:text-purple-400 text-sm transition-all"
                                        >
                                            + Add Lesson
                                        </button>
                                    )}

                                    {/* Lessons List */}
                                    {module.lessons.length === 0 ? (
                                        <p className="text-center text-slate-500 text-sm py-2">No lessons added yet</p>
                                    ) : (
                                        module.lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${lesson.completed ? 'bg-green-500/10' : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => toggleAiLesson(module.id, lesson.id)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${lesson.completed
                                                            ? 'bg-green-500 text-white text-xs'
                                                            : 'border border-slate-500 hover:border-purple-500'
                                                        }`}
                                                >
                                                    {lesson.completed && '✓'}
                                                </button>
                                                <span className={`flex-1 text-sm ${lesson.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                                    {lesson.name}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Academics;
