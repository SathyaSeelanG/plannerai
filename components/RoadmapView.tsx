import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Task, TaskStatus, LearningResource } from '../types';
import StudySessionModal from './StudySessionModal';
import RoadmapGraphView from './RoadmapGraphView';
import Header from './Header';

const RoadmapNode: React.FC<{
    task: Task;
    status: TaskStatus;
    onClick: () => void;
}> = ({ task, status, onClick }) => {
    const statusClasses = {
        [TaskStatus.Completed]: 'border-green-500 bg-green-900/30 hover:bg-green-900/50',
        [TaskStatus.InProgress]: 'border-yellow-500 bg-yellow-900/30 hover:bg-yellow-900/50',
        [TaskStatus.NotStarted]: 'border-gray-600 bg-white/5 hover:border-primary',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group ${statusClasses[status]}`}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-3">
                    {status === TaskStatus.Completed ? (
                        <span className="material-symbols-outlined fill text-green-400 mt-1 animate-pop">check_circle</span>
                    ) : (
                        <span className="material-symbols-outlined text-gray-500 mt-1 group-hover:text-primary">radio_button_unchecked</span>
                    )}
                    <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 text-xs font-bold bg-surface-dark text-text-secondary px-2 py-1 rounded-full border border-gray-600">
                    {task.estimatedHours} hrs
                </div>
            </div>
            {task.subtopics && task.subtopics.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    {task.subtopics.map(sub => (
                        <span key={sub} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{sub}</span>
                    ))}
                </div>
            )}
        </button>
    );
};

const ResourceIcon: React.FC<{ type: string }> = ({ type }) => {
    let iconName = 'article';
    switch (type) {
        case 'video': iconName = 'play_circle'; break;
        case 'course':
        case 'book': iconName = 'book'; break;
        case 'interactive': iconName = 'touch_app'; break;
        default: iconName = 'article'; break;
    }
    return <span className="material-symbols-outlined text-primary">{iconName}</span>;
};


export const RoadmapView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getRoadmapById, isLoading, roadmaps, setChatContext } = useAppContext();
    const [activeTask, setActiveTask] = useState<{ milestoneId: string; task: Task } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortOption, setSortOption] = useState<'default' | 'rating'>('default');


    const roadmap = useMemo(() => id ? getRoadmapById(id) : undefined, [id, getRoadmapById, roadmaps]);

    // Update chat context based on roadmap and active task
    useEffect(() => {
        if (activeTask && roadmap) {
            // If a task is open, set context to that task
            setChatContext({
                type: 'task',
                data: {
                    task: activeTask.task,
                    roadmapTitle: roadmap.title
                }
            });
        } else if (roadmap) {
            // Otherwise, set context to the roadmap
            setChatContext({ type: 'roadmap', data: roadmap });
        }
        return () => setChatContext(null); // Cleanup context on unmount
    }, [roadmap, activeTask, setChatContext]);


    const filteredOverallResources = useMemo(() => {
        if (!roadmap?.overallResources) return [];
        let result = [...roadmap.overallResources];

        if (filterType !== 'all') {
            result = result.filter(r => r.type === filterType);
        }

        if (sortOption === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        return result;
    }, [roadmap?.overallResources, filterType, sortOption]);


    const overallProgress = useMemo(() => {
        if (!roadmap) return 0;
        const totalTasks = roadmap.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
        if (totalTasks === 0) return 0;
        const completedTasks = roadmap.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.status === TaskStatus.Completed).length, 0);
        return (completedTasks / totalTasks) * 100;
    }, [roadmap]);

    if (isLoading) {
        return <div className="text-center py-16">
            <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '48px' }}>progress_activity</span>
            <p className="mt-4 text-lg">Loading your roadmap...</p>
        </div>
    }

    if (!roadmap) {
        return <div className="text-center mt-10">Roadmap not found.</div>;
    }

    const shareUrl = `${window.location.origin}/share/roadmap/${roadmap.id}`;

    return (
        <>
            <Header title={roadmap.title} />
            <div className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        {/* <h1 className="text-2xl font-bold text-white">{roadmap.title}</h1> */}
                        <p className="text-text-secondary mt-2 max-w-3xl">{roadmap.description}</p>
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            alert("Roadmap link copied to clipboard!");
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span>
                        Share
                    </button>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-white">Overall Progress</span>
                        <span className="text-sm font-medium text-white">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="mb-8 flex justify-center">
                <div className="inline-flex rounded-md shadow-sm bg-surface-dark p-1" role="group">
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>list</span>
                        List View
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('graph')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'graph' ? 'bg-primary text-white' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_tree</span>
                        Graph View
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {viewMode === 'list' ? (
                        <div className="space-y-12">
                            {roadmap.milestones.map((milestone) => (
                                <div key={milestone.id}>
                                    <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-primary pl-4">{milestone.title}</h2>
                                    <div className="space-y-4">
                                        {milestone.tasks.map((task) => (
                                            <RoadmapNode
                                                key={task.id}
                                                task={task}
                                                status={task.status}
                                                onClick={() => setActiveTask({ milestoneId: milestone.id, task })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <RoadmapGraphView roadmap={roadmap} onTaskClick={(milestoneId, task) => setActiveTask({ milestoneId, task })} />
                    )}
                </div>

                {roadmap.overallResources && roadmap.overallResources.length > 0 && (
                    <div className="lg:col-span-1">
                        <div className="sticky top-10 p-6 bg-surface-dark rounded-lg border border-border-dark">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Courses & Guides</h2>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as any)}
                                    className="bg-background-dark text-white text-xs rounded border border-border-dark focus:border-primary outline-none px-2 py-1"
                                >
                                    <option value="default">Default</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>

                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {['all', 'course', 'book', 'documentation'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-2 py-1 rounded text-xs whitespace-nowrap capitalize ${filterType === type
                                            ? 'bg-primary text-white font-bold'
                                            : 'bg-white/5 text-text-secondary hover:bg-white/10'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {filteredOverallResources.length > 0 ? (
                                    filteredOverallResources.map((res, i) => (
                                        <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-transparent hover:border-primary transition-colors group">
                                            <ResourceIcon type={res.type} />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-white block truncate group-hover:text-primary transition-colors">{res.title}</span>
                                                {res.rating && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-yellow-500 fill" style={{ fontSize: '14px' }}>star</span>
                                                        <span className="text-xs text-text-secondary">{res.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-sm text-text-secondary italic">No resources found for this filter.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {activeTask && (
                <StudySessionModal
                    roadmapId={roadmap.id}
                    milestoneId={activeTask.milestoneId}
                    task={activeTask.task}
                    onClose={() => setActiveTask(null)}
                />
            )}
        </>
    );
};
