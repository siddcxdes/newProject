import { useState } from 'react';
import AIChatbot from './AIChatbot';

const FloatingAIChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] glass-card flex flex-col overflow-hidden shadow-2xl animate-fade-in">
                    {/* Header */}
                    <div className="p-4 bg-elevated border-b border-subtle flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M4.93 19.07a20 20 0 0 0 .1.1" /><path d="M19.07 4.93a20 20 0 0 0 .1.1" /><path d="M12 17v4" /><path d="m15.2 21.3 1.2-1.2" /><path d="m8.8 21.3-1.2-1.2" /><path d="M15.2 16.4a4 4 0 1 0-6.4 0" /><path d="m5 16 .5 1" /><path d="m19 16-.5 1" /><path d="m12 12 1 2" /></svg>
                            AI Assistant
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-heading"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden bg-surface">
                        <AIChatbot variant="widget" />
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-all duration-300 border border-subtle ${isOpen
                    ? 'bg-elevated text-zinc-500 hover:text-heading'
                    : 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sky-500/25'
                    }`}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M4.93 19.07a20 20 0 0 0 .1.1" /><path d="M19.07 4.93a20 20 0 0 0 .1.1" /><path d="M12 17v4" /><path d="m15.2 21.3 1.2-1.2" /><path d="m8.8 21.3-1.2-1.2" /><path d="M15.2 16.4a4 4 0 1 0-6.4 0" /><path d="m5 16 .5 1" /><path d="m19 16-.5 1" /><path d="m12 12 1 2" /></svg>
                )}
            </button>
        </div>
    );

};

export default FloatingAIChat;
