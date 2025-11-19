import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Roadmap, TaskStatus } from '../types';
import { AuthControls } from './AuthControls';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; isPrimary?: boolean }> = ({ title, value, icon, isPrimary = false }) => (
    <div className="flex flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isPrimary ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">{title}</p>
        </div>
        <p className={`text-3xl font-bold leading-tight ${isPrimary ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
);

const RoadmapCard: React.FC<{ roadmap: Roadmap }> = ({ roadmap }) => {
    const totalTasks = roadmap.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
    const completedTasks = roadmap.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.status === TaskStatus.Completed).length, 0);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const pseudoRandomImage = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const imageIndex = Math.abs(hash % 3) + 1;
        return `https://source.unsplash.com/random/400x200?abstract&sig=${imageIndex}${id}`;
    };

    return (
        <div className="group flex flex-col rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-gray-200 dark:border-border-dark hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="w-full h-32 bg-center bg-no-repeat bg-cover relative" style={{ backgroundImage: `url(${pseudoRandomImage(roadmap.id)})` }}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <div className="flex flex-col flex-1 p-5 gap-4">
                <div>
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight line-clamp-1" title={roadmap.title}>{roadmap.title}</h3>
                    <div className="flex items-center justify-between mt-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-text-secondary">Progress</span>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <Link to={`/roadmap/${roadmap.id}`} className="mt-auto">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-900 dark:text-white text-sm font-bold transition-colors">
                        <span>Continue</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </Link>
            </div>
        </div>
    );
};

const ThisWeeksFocus: React.FC = () => {
    const upcomingTasks = [
        { icon: 'code', title: 'Learn CSS Flexbox', roadmap: 'Web Dev Fundamentals', day: 'Today', color: 'text-blue-400' },
        { icon: 'draw', title: 'Wireframing basics', roadmap: 'UX/UI Design Principles', day: 'Tomorrow', color: 'text-purple-400' },
        { icon: 'code', title: 'JavaScript DOM', roadmap: 'Web Dev Fundamentals', day: 'Wed', color: 'text-yellow-400' },
        { icon: 'calculate', title: 'Python Setup', roadmap: 'Intro to Data Science', day: 'Fri', color: 'text-green-400' },
    ];

    return (
        <div className="lg:col-span-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-border-dark h-fit sticky top-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 dark:text-white text-lg font-bold">This Week's Focus</h2>
                <button className="text-primary text-sm font-medium hover:underline">View Calendar</button>
            </div>
            <div className="flex flex-col gap-3">
                {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-border-dark">
                        <div className={`flex-shrink-0 size-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <span className={`material-symbols-outlined ${task.color}`} style={{ fontSize: '20px' }}>{task.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</p>
                            <p className="text-xs text-gray-500 dark:text-text-secondary truncate">{task.roadmap}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {task.day}
                        </span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-gray-500 dark:text-text-secondary border border-dashed border-gray-300 dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                + Add Custom Task
            </button>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { roadmaps, stats, isLoading, isConfigured, configurationError, isGuest, saveToAccount, setChatContext } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setChatContext({ type: 'dashboard', data: { roadmaps, stats } });
        return () => setChatContext(null);
    }, [roadmaps, stats, setChatContext]);

    const handleSaveToAccount = async () => {
        setIsSaving(true);
        try {
            await saveToAccount();
        } catch (error) {
            console.error('Failed to save to account:', error);
        } finally {
            setIsSaving(false);
        }
    };


    if (!isConfigured) {
        return (
            <div className="container mx-auto text-center mt-10 p-6 bg-red-900/50 border border-red-700 rounded-lg">
                <h1 className="text-2xl font-bold text-white mb-4">Database Not Configured</h1>
                <p className="text-red-200 mb-4">{configurationError}</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in pb-10">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome back! <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-gray-600 dark:text-text-secondary text-lg">
                        Ready to continue your learning journey?
                    </p>
                </div>
                <Link to="/create">
                    <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                        <span className="material-symbols-outlined">add_circle</span>
                        Create New Roadmap
                    </button>
                </Link>
            </div>

            {/* Guest Warning */}
            {isGuest && roadmaps.length > 0 && (
                <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                        <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                            You're browsing as a guest. Save your progress by signing in.
                        </p>
                    </div>
                    <AuthControls
                        showSaveButton={true}
                        onSaveToAccount={handleSaveToAccount}
                        className="w-full sm:w-auto"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard title="Hours Studied" value={stats.hoursStudied} icon="schedule" />
                        <StatCard title="Completed" value={stats.roadmapsCompleted} icon="check_circle" />
                        <StatCard title="Streak" value={`${stats.currentStreak} days`} icon="local_fire_department" isPrimary />
                    </div>

                    {/* Active Roadmaps */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">school</span>
                                Active Roadmaps
                            </h2>
                            <button className="text-sm text-gray-500 dark:text-text-secondary hover:text-primary transition-colors">View All</button>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark">
                                <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
                                <p className="mt-4 text-gray-500 dark:text-text-secondary">Loading your roadmaps...</p>
                            </div>
                        ) : roadmaps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {roadmaps.map(roadmap => (
                                    <RoadmapCard key={roadmap.id} roadmap={roadmap} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark text-center px-4">
                                <div className="size-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-gray-400 text-3xl">rocket_launch</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start your first journey</h3>
                                <p className="text-gray-500 dark:text-text-secondary max-w-md mb-6">
                                    Create an AI-powered roadmap to structure your learning path and track your progress.
                                </p>
                                <Link to="/create" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                                    Create First Roadmap
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                {/* <ThisWeeksFocus /> */}
            </div>
        </div>
    );
};

export default Dashboard;