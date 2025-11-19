
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Roadmap, TaskStatus } from '../types';
import { AuthControls } from './AuthControls';

const StatCard: React.FC<{ title: string; value: string | number; isPrimary?: boolean }> = ({ title, value, isPrimary = false }) => (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-white dark:bg-[#111f22] border border-gray-200 dark:border-[#325e67]">
        <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">{title}</p>
        <p className={`${isPrimary ? 'text-primary' : 'text-gray-900 dark:text-white'} tracking-light text-2xl font-bold leading-tight`}>{value}</p>
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
        <div className="flex flex-col rounded-xl bg-white dark:bg-[#192f33] shadow-sm border border-gray-200 dark:border-transparent">
            <div className="w-full bg-center bg-no-repeat aspect-[16/8] bg-cover rounded-t-xl" style={{ backgroundImage: `url(${pseudoRandomImage(roadmap.id)})` }}></div>
            <div className="flex flex-col flex-1 justify-between p-4 gap-4">
                <div>
                    <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">{roadmap.title}</p>
                    <p className="text-gray-500 dark:text-[#92c0c9] text-sm font-normal leading-normal mt-1">Progress: {progress}%</p>
                    <div className="w-full bg-gray-200 dark:bg-[#234248] rounded-full h-2 mt-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <Link to={`/roadmap/${roadmap.id}`}>
                    <button className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 dark:bg-[#234248] text-gray-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
                        <span className="truncate">Continue Learning</span>
                    </button>
                </Link>
            </div>
        </div>
    );
};

const ThisWeeksFocus: React.FC = () => {
    const upcomingTasks = [
        { icon: 'code', title: 'Learn CSS Flexbox', roadmap: 'Web Dev Fundamentals', day: 'Today' },
        { icon: 'draw', title: 'Wireframing basics', roadmap: 'UX/UI Design Principles', day: 'Tomorrow' },
        { icon: 'code', title: 'JavaScript DOM Manipulation', roadmap: 'Web Dev Fundamentals', day: 'Wed' },
        { icon: 'calculate', title: 'Setup Python Environment', roadmap: 'Intro to Data Science', day: 'Fri' },
    ];

    return (
        <div className="lg:col-span-1 bg-white dark:bg-[#111f22] p-6 rounded-xl border border-gray-200 dark:border-[#325e67]">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">This Week's Focus</h2>
            <div className="mt-6 flex flex-col gap-4">
                {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-100 dark:bg-[#192f33]">
                        <div className="flex-shrink-0 size-8 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>{task.icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                            <p className="text-xs text-gray-500 dark:text-[#92c0c9] mt-1">{task.roadmap}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-[#92c0c9]">{task.day}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { roadmaps, stats, isLoading, isConfigured, configurationError, isAuthenticated, isGuest, saveToAccount, setChatContext } = useAppContext();
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
        <>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
                <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Welcome back!</p>
                    {isGuest && roadmaps.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                                You're browsing as a guest. Your roadmaps are saved locally.
                            </p>
                            <AuthControls 
                                showSaveButton={true} 
                                onSaveToAccount={handleSaveToAccount}
                                className="justify-start"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                        <StatCard title="Hours Studied" value={stats.hoursStudied} />
                        <StatCard title="Roadmaps Completed" value={stats.roadmapsCompleted} />
                        <StatCard title="Current Streak" value={`${stats.currentStreak} days`} isPrimary />
                    </div>
                    <div>
                        <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Active Roadmaps</h2>
                        {isLoading ? (
                             <div className="text-center py-16">
                                <span className="material-symbols-outlined text-primary animate-spin" style={{fontSize: '48px'}}>progress_activity</span>
                                <p className="mt-4 text-lg">Loading your roadmaps...</p>
                            </div>
                        ) : roadmaps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {roadmaps.map(roadmap => (
                                    <RoadmapCard key={roadmap.id} roadmap={roadmap} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-16 bg-white dark:bg-[#111f22] rounded-lg border border-gray-200 dark:border-[#325e67]">
                                <h3 className="text-xl font-semibold">Your learning journey starts here!</h3>
                                <p className="text-gray-500 dark:text-[#92c0c9] mt-2 mb-6">Create your first AI-powered roadmap to get started.</p>
                                <Link to="/create" className="inline-flex items-center gap-2 bg-primary text-[#111f22] font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                                    Create First Roadmap
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <ThisWeeksFocus />
            </div>
        </>
    );
};

export default Dashboard;