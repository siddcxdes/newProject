import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const QuoteCard = () => {
    const { user, updateSettings } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [quote, setQuote] = useState(user?.quote || "The only way to do great work is to love what you do.");

    const handleSave = async () => {
        await updateSettings({ quote });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setQuote(user?.quote || "The only way to do great work is to love what you do.");
        setIsEditing(false);
    };

    return (
        <div className="glass-card p-5 relative min-h-[100px] flex flex-col justify-between">
            {isEditing ? (
                <>
                    <textarea
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        className="w-full bg-transparent text-[var(--color-text-primary)] text-sm italic resize-none focus:outline-none"
                        rows={3}
                        placeholder="Enter your motivational quote..."
                        maxLength={200}
                    />
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 bg-sky-500 text-heading text-xs rounded-lg hover:bg-sky-600 transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 bg-zinc-700 text-heading text-xs rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-1">
                        <p className="text-[var(--color-text-primary)] text-sm italic leading-relaxed">
                            "{user?.quote || quote}"
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        title="Edit quote"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
};

export default QuoteCard;
