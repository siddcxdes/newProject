import { getGreeting } from '../../utils/dateUtils';

const Greeting = ({ userName = 'Champion' }) => {
    const greeting = getGreeting();

    return (
        <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {greeting.text}, {userName}! {greeting.emoji}
            </h1>
            <p className="text-slate-400 text-lg">
                Ready to level up today?
            </p>
        </div>
    );
};

export default Greeting;
