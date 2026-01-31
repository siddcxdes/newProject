import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AIChatbot = ({ onRoadmapGenerated, variant = 'full' }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [conversation, setConversation] = useState([]);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';



    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setError('');

        // Add user message to conversation
        const userMessage = { role: 'user', content: prompt };
        setConversation(prev => [...prev, userMessage]);

        try {
            // Handle double /api issue if API_URL already includes it
            const endpoint = API_URL.endsWith('/api')
                ? `${API_URL}/ai/generate-roadmap`
                : `${API_URL}/api/ai/generate-roadmap`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt.trim() })
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend is not responding correctly. Make sure the backend server is running on port 5001 and you have added GEMINI_API_KEY to .env file.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate roadmap');
            }

            if (data.success) {
                // Add AI response to conversation
                const itemTypeName = data.type === 'workout' ? 'exercises' : data.type === 'diet' ? 'meals' : 'learning items';
                const containerTypeName = data.type === 'workout' ? 'workouts' : data.type === 'diet' ? 'plan' : 'domains';

                const aiMessage = {
                    role: 'assistant',
                    content: `Generated ${data.itemCount} ${itemTypeName} in your ${data.type} plan!`,
                    data: data.data,
                    dataType: data.type, // 'learning', 'workout', 'diet'
                    itemCount: data.itemCount
                };
                setConversation(prev => [...prev, aiMessage]);

                // Pass the data to parent component (legacy support mainly)
                if (onRoadmapGenerated) {
                    onRoadmapGenerated(data.data);
                }

                setPrompt('');
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (err) {
            console.error('Generation error:', err);

            // Better error messages
            let errorMsg = err.message;
            if (err.message.includes('Failed to fetch')) {
                errorMsg = 'Cannot connect to backend. Make sure the backend server is running (npm run dev in /backend folder).';
            } else if (err.message.includes('JSON')) {
                errorMsg = 'Backend returned an error. Check if GEMINI_API_KEY is set in /backend/.env file.';
            }

            setError(errorMsg);

            // Add error message to conversation
            const errorMessage = {
                role: 'error',
                content: errorMsg
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const clearConversation = () => {
        setConversation([]);
        setError('');
        setPrompt('');
    };

    const isWidget = variant === 'widget';

    return (
        <div className={`space-y-4 ${isWidget ? 'h-full flex flex-col p-3' : ''}`}>
            {/* Header */}
            <div className={`${isWidget ? 'flex-1 flex flex-col min-h-0' : 'glass-card p-5'}`}>
                {!isWidget && (
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-base font-semibold text-heading flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M4.93 19.07a20 20 0 0 0 .1.1" /><path d="M19.07 4.93a20 20 0 0 0 .1.1" /><path d="M12 17v4" /><path d="m15.2 21.3 1.2-1.2" /><path d="m8.8 21.3-1.2-1.2" /><path d="M15.2 16.4a4 4 0 1 0-6.4 0" /><path d="m5 16 .5 1" /><path d="m19 16-.5 1" /><path d="m12 12 1 2" /></svg>
                                AI Plan Generator
                            </h3>
                            <p className="text-sm text-muted mt-1">
                                Create learning roadmaps, workout routines, or diet plans
                            </p>
                        </div>
                        {conversation.length > 0 && (
                            <button
                                onClick={clearConversation}
                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                Clear Chat
                            </button>
                        )}
                    </div>
                )}

                {/* Example Prompts */}


                {/* Conversation History */}
                {conversation.length > 0 && (
                    <div className={`${isWidget ? 'flex-1 overflow-y-auto mb-3 space-y-3' : 'mb-4 space-y-3 max-h-96 overflow-y-auto p-3 bg-elevated rounded-lg border border-subtle'}`}>
                        {conversation.map((message, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg ${message.role === 'user'
                                    ? 'bg-sky-500/10 border border-sky-500/20 ml-8'
                                    : message.role === 'error'
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-emerald-500/10 border border-emerald-500/20 mr-8'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-sm flex-shrink-0 mt-0.5">
                                        {message.role === 'user' ? (
                                            <div className="w-6 h-6 rounded-full bg-surface border border-subtle flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                        ) : message.role === 'error' ? (
                                            <div className="w-6 h-6 rounded-full bg-red-900/30 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-sky-900/30 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M4.93 19.07a20 20 0 0 0 .1.1" /><path d="M19.07 4.93a20 20 0 0 0 .1.1" /><path d="M12 17v4" /><path d="m15.2 21.3 1.2-1.2" /><path d="m8.8 21.3-1.2-1.2" /><path d="M15.2 16.4a4 4 0 1 0-6.4 0" /><path d="m5 16 .5 1" /><path d="m19 16-.5 1" /><path d="m12 12 1 2" /></svg>
                                            </div>
                                        )}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-heading">{message.content}</p>
                                        {message.data && (
                                            <div className="mt-2 text-xs text-zinc-500">
                                                <p>✅ {message.dataType === 'workout' ? 'Workout' : message.dataType === 'diet' ? 'Diet plan' : 'Roadmap'} ready to import!</p>
                                                <div className="flex gap-3 mt-2">
                                                    {isWidget && (
                                                        <button
                                                            onClick={() => navigate('/admin', { state: { importData: message.data, importType: message.dataType } })}
                                                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium underline"
                                                        >
                                                            Review & Import
                                                        </button>
                                                    )}
                                                    {isWidget && (
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(JSON.stringify(message.data, null, 2))}
                                                            className="text-[10px] text-sky-400 hover:text-sky-300 underline"
                                                        >
                                                            Copy JSON
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="p-3 rounded-lg bg-elevated border border-subtle mr-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-sky-900/30 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M4.93 19.07a20 20 0 0 0 .1.1" /><path d="M19.07 4.93a20 20 0 0 0 .1.1" /><path d="M12 17v4" /><path d="m15.2 21.3 1.2-1.2" /><path d="m8.8 21.3-1.2-1.2" /><path d="M15.2 16.4a4 4 0 1 0-6.4 0" /><path d="m5 16 .5 1" /><path d="m19 16-.5 1" /><path d="m12 12 1 2" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                            <span className="text-sm text-zinc-500 ml-2">Generating your roadmap...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Input Area */}
                <div className="space-y-3">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Example: I want to be an AI/ML engineer in next 3 months"
                        className="input-field w-full p-3 resize-none"
                        rows={3}
                        disabled={isGenerating}
                    />

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">⚠️ {error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between">

                        <button
                            onClick={handleGenerate}
                            className="btn-primary text-sm px-6"
                            disabled={!prompt.trim() || isGenerating}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </span>
                            ) : (
                                'Generate Roadmap'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Card - Hide in widget mode */}
            {!isWidget && (
                <div className="glass-card p-4">
                    <h4 className="text-sm font-semibold text-heading mb-2">How it works</h4>
                    <ul className="space-y-1.5 text-xs text-zinc-500">
                        <li className="flex items-start gap-2">
                            <span className="text-sky-400 mt-0.5">1.</span>
                            <span>Describe your learning goal or exam you want to crack</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sky-400 mt-0.5">2.</span>
                            <span>AI generates a comprehensive roadmap with domains, topics, and subtopics</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sky-400 mt-0.5">3.</span>
                            <span>The generated JSON is automatically formatted for bulk import</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sky-400 mt-0.5">4.</span>
                            <span>Review and import to your learning domains instantly</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
