// Workout Routine Template
export interface WorkoutExercise {
    name: string;
    sets?: string;
    reps?: string;
    duration?: string;
    notes?: string;
}

export interface WorkoutDay {
    dayNumber: number;
    name: string;
    focus: string;
    exercises: WorkoutExercise[];
    rest: string;
}

export const DEFAULT_WORKOUT_ROUTINE: WorkoutDay[] = [
    {
        dayNumber: 1,
        name: 'Upper Body Strength + Explosiveness + Arms',
        focus: 'Chest, Back, Shoulders, Arms',
        exercises: [
            { name: 'Bench Press', sets: '5', reps: '5' },
            { name: 'Incline Dumbbell Press', sets: '4', reps: '8-10', notes: '+ Push-Ups ×15' },
            { name: 'Pull-Ups', sets: '4', reps: '6-8' },
            { name: 'Barbell Rows', sets: '4', reps: '6' },
            { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10' },
            { name: 'Barbell Curls', sets: '4', reps: '10' },
            { name: 'Overhead Dumbbell Tricep Extension', sets: '3', reps: '12' },
            { name: 'Plyo Push-Ups', sets: '3', reps: '10-12' },
        ],
        rest: '60-90 sec (heavy), 45-60 sec (arms)',
    },
    {
        dayNumber: 2,
        name: 'Lower Body Strength + Explosiveness + Pelvic Floor',
        focus: 'Legs, Glutes, Core',
        exercises: [
            { name: 'Squats', sets: '5', reps: '5' },
            { name: 'Romanian Deadlift', sets: '4', reps: '8' },
            { name: 'Walking Lunges', sets: '4', reps: '12 each leg' },
            { name: 'Hip Thrusters', sets: '4', reps: '12-15' },
            { name: 'Side Hip Abductions', sets: '3', reps: '12 each' },
            { name: 'Box/Broad Jumps', sets: '4', reps: '10' },
            { name: 'Calf Raises', sets: '4', reps: '20' },
            { name: 'Hanging Leg Raises', sets: '4', reps: '12' },
        ],
        rest: '60-90 sec',
    },
    {
        dayNumber: 3,
        name: 'Cardio + Core + Arms',
        focus: 'Endurance, Core, Arms',
        exercises: [
            { name: 'Zone 2 Cardio', duration: '40 min' },
            { name: 'Plank', duration: '60 sec' },
            { name: 'Side Plank', duration: '40 sec each' },
            { name: 'Bicycle Crunch', reps: '25' },
            { name: 'Leg Raises', reps: '20' },
            { name: 'Push-Ups', reps: '15-20' },
            { name: 'Optional HIIT', notes: '20 sec sprint / 40 sec jog × 5' },
        ],
        rest: 'Active recovery',
    },
    {
        dayNumber: 4,
        name: 'Upper Body Power + Hypertrophy + Arms',
        focus: 'Power, Muscle Building, Arms',
        exercises: [
            { name: 'Push Press', sets: '4', reps: '5' },
            { name: 'Pull-Ups / Chin-Ups', sets: '4', reps: '8-10' },
            { name: 'Barbell Curls', sets: '4', reps: '12' },
            { name: 'Tricep Dips + Diamond Push-Ups', sets: '4', reps: '12' },
            { name: 'Cable Lateral Raises', sets: '4', reps: '15' },
            { name: 'Dumbbell/Kettlebell Power Swings', sets: '4', duration: '20 sec' },
            { name: 'Hammer Curls', sets: '3', reps: '12' },
        ],
        rest: '45-60 sec',
    },
    {
        dayNumber: 5,
        name: 'Lower Body Explosive + Conditioning + Pelvic Floor',
        focus: 'Explosiveness, Conditioning, Glutes',
        exercises: [
            { name: 'Deadlift', sets: '5', reps: '5' },
            { name: 'Bulgarian Split Squats', sets: '4', reps: '10 each' },
            { name: 'Kettlebell Swings', sets: '4', reps: '15-20' },
            { name: 'Hip Thrusters', sets: '3', reps: '12-15' },
            { name: 'Side Hip Abductions', sets: '3', reps: '12' },
            { name: 'Sprints', notes: '25 sec sprint / 35 sec walk × 12' },
            { name: 'Calf Raises', sets: '4', reps: '20' },
        ],
        rest: '60-90 sec',
    },
    {
        dayNumber: 6,
        name: 'Full Body Circuit + Arms + Pelvic Floor',
        focus: 'Full Body, Endurance',
        exercises: [
            { name: 'Push-Ups', reps: '20' },
            { name: 'Pull-Ups', reps: '10' },
            { name: 'Goblet Squats', reps: '15' },
            { name: 'Kettlebell Swings', reps: '15' },
            { name: 'Hip Thrusters', reps: '12-15' },
            { name: 'Side Hip Abductions', reps: '12 each' },
            { name: 'Barbell Curls', reps: '12' },
            { name: 'Cable Tricep Pushdowns', reps: '12' },
            { name: 'Plank', duration: '60 sec' },
            { name: 'Optional Zone 2', duration: '20 min' },
        ],
        rest: 'Circuit style - minimal rest',
    },
];
