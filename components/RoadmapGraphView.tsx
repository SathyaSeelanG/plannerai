
import React from 'react';
import { Roadmap, Task, TaskStatus, Milestone } from '../types';

interface RoadmapGraphViewProps {
    roadmap: Roadmap;
    onTaskClick: (milestoneId: string, task: Task) => void;
}

const TaskNode: React.FC<{ task: Task; onTaskClick: () => void; }> = ({ task, onTaskClick }) => {
    const statusClasses = {
        [TaskStatus.Completed]: 'bg-green-500/20 border-green-500',
        [TaskStatus.InProgress]: 'bg-yellow-500/20 border-yellow-500',
        [TaskStatus.NotStarted]: 'bg-[#192f33] border-gray-600 hover:border-primary',
    };
    
    return (
        <button
            onClick={onTaskClick}
            className={`w-full max-w-sm text-left p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 shadow-md ${statusClasses[task.status]}`}
        >
            <p className="font-semibold text-sm text-white">{task.title}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs opacity-70 text-[#92c0c9]">{task.estimatedHours} hrs</p>
                {task.status === TaskStatus.Completed && <span className="material-symbols-outlined fill text-green-400" style={{fontSize: '20px'}}>check_circle</span>}
            </div>
        </button>
    );
};

const MilestoneNode: React.FC<{
    milestone: Milestone;
    onTaskClick: (milestoneId: string, task: Task) => void;
    isLast: boolean;
}> = ({ milestone, onTaskClick, isLast }) => (
    <div className="relative pl-12 pb-12">
        {!isLast && <div className="absolute left-[18px] top-5 h-full w-0.5 bg-gray-700"></div>}
        <div className="absolute left-0 top-2 flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center ring-8 ring-background-dark">
                 <span className="material-symbols-outlined text-[#111f22]">flag</span>
            </div>
             <h3 className="text-xl font-bold text-white ml-4">{milestone.title}</h3>
        </div>
        <div className="pt-16 space-y-4">
            {milestone.tasks.map((task) => (
                <TaskNode key={task.id} task={task} onTaskClick={() => onTaskClick(milestone.id, task)} />
            ))}
        </div>
    </div>
);


const RoadmapGraphView: React.FC<RoadmapGraphViewProps> = ({ roadmap, onTaskClick }) => {
    return (
        <div className="container mx-auto max-w-3xl p-4 animate-fade-in">
             <div className="relative">
                {roadmap.milestones.map((milestone, index) => (
                    <MilestoneNode 
                        key={milestone.id} 
                        milestone={milestone} 
                        onTaskClick={onTaskClick}
                        isLast={index === roadmap.milestones.length - 1}
                    />
                 ))}
            </div>
        </div>
    );
};

export default RoadmapGraphView;
