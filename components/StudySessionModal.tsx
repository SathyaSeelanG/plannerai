import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, LearningResource } from '../types';
import { useAppContext } from '../context/AppContext';

interface StudySessionModalProps {
  roadmapId: string;
  milestoneId: string;
  task: Task;
  onClose: () => void;
}

const ResourceIcon: React.FC<{ type: string }> = ({ type }) => {
    let iconName = 'article';
    switch (type) {
        case 'video': iconName = 'play_circle'; break;
        case 'course':
        case 'book': iconName = 'book'; break;
        case 'interactive': iconName = 'touch_app'; break;
        default: iconName = 'article'; break;
    }
    return <span className="material-symbols-outlined text-[#92c0c9]">{iconName}</span>;
};


const ResourceLink: React.FC<LearningResource> = ({ type, url, title, rating }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col p-3 bg-[#111f22] rounded-lg border border-[#325e67] hover:border-primary transition-colors group h-full">
        <div className="flex items-center gap-3 mb-2">
            <ResourceIcon type={type} />
            <span className="text-xs text-[#92c0c9] uppercase font-bold tracking-wider">{type}</span>
            {rating && (
                <div className="ml-auto flex items-center gap-1 bg-[#192f33] px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-yellow-500 fill" style={{fontSize: '12px'}}>star</span>
                    <span className="text-xs text-white font-medium">{rating}</span>
                </div>
            )}
        </div>
        <span className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">{title}</span>
    </a>
);


const StudySessionModal: React.FC<StudySessionModalProps> = ({ roadmapId, milestoneId, task, onClose }) => {
  const { updateTaskStatus } = useAppContext();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'default' | 'rating'>('rating');

  const filteredResources = useMemo(() => {
      if (!task.resources) return [];
      let result = [...task.resources];

      if (filterType !== 'all') {
          result = result.filter(r => r.type === filterType);
      }

      if (sortOption === 'rating') {
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      return result;
  }, [task.resources, filterType, sortOption]);


  useEffect(() => {
    let interval: number | null = null;
    if (timerOn) {
      interval = window.setInterval(() => {
        setTime(prevTime => prevTime + 10); // +10ms
      }, 10);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerOn]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    updateTaskStatus(roadmapId, milestoneId, task.id, newStatus, task.estimatedHours);
  };

  const handleComplete = () => {
    handleStatusChange(TaskStatus.Completed);
    onClose();
  };
  
  useEffect(() => {
      if(status === TaskStatus.NotStarted && timerOn) {
          handleStatusChange(TaskStatus.InProgress);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerOn]);

  const formatTime = (time: number) => {
      const minutes = ("0" + Math.floor((time / 60000) % 60)).slice(-2);
      const seconds = ("0" + Math.floor((time / 1000) % 60)).slice(-2);
      return `${minutes}:${seconds}`;
  }

  const resourceTypes = ['all', 'video', 'article', 'course', 'documentation', 'interactive'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#192f33] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up border border-[#325e67]">
        <div className="p-6 border-b border-[#325e67] flex justify-between items-center">
          <div>
            <span className="text-xs bg-primary text-[#111f22] px-2 py-1 rounded-full font-bold">{task.estimatedHours} hrs</span>
            <h2 className="text-2xl font-bold mt-2 text-white">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#234248]">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <p className="text-[#92c0c9] mb-6 text-lg">{task.description}</p>
          
           {task.subtopics && task.subtopics.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lightbulb</span>
                        Key Concepts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {task.subtopics.map((subtopic) => (
                            <span key={subtopic} className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary/20">
                                {subtopic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

             <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <h3 className="font-semibold text-white text-xl">Recommended Resources</h3>
                     <div className="flex items-center gap-2">
                         <label className="text-xs text-[#92c0c9] uppercase font-bold">Sort by:</label>
                         <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value as any)}
                            className="bg-[#111f22] text-white text-sm rounded-lg border border-[#325e67] focus:border-primary outline-none px-3 py-1.5"
                        >
                            <option value="rating">Highest Rated</option>
                            <option value="default">Default</option>
                        </select>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {resourceTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap capitalize transition-all ${
                                filterType === type 
                                ? 'bg-primary text-[#111f22] font-bold shadow-md transform scale-105' 
                                : 'bg-[#111f22] text-[#92c0c9] border border-[#325e67] hover:border-primary/50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.length > 0 ? (
                        filteredResources.map((res, i) => (
                           <ResourceLink key={i} {...res} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 border border-dashed border-[#325e67] rounded-lg">
                            <span className="material-symbols-outlined text-[#325e67] text-4xl">search_off</span>
                            <p className="text-[#92c0c9] mt-2">No resources found for this filter.</p>
                        </div>
                    )}
                </div>
            </div>

          <div className="bg-[#111f22] p-6 rounded-xl border border-[#325e67] flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">timer</span> Study Timer
            </h3>
            <div className="text-6xl font-mono mb-6 text-white tracking-widest">{formatTime(time)}</div>
            <div className="flex gap-4 w-full max-w-md justify-center">
                <button onClick={() => setTimerOn(true)} disabled={timerOn} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
                    Start
                </button>
                <button onClick={() => setTimerOn(false)} disabled={!timerOn} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
                    Pause
                </button>
                <button onClick={() => { setTime(0); setTimerOn(false); }} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-lg">
                    Reset
                </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#325e67] bg-[#111f22] rounded-b-lg">
            {status !== TaskStatus.Completed ? (
                 <button 
                 onClick={handleComplete}
                 className="w-full bg-primary text-[#111f22] font-bold py-4 rounded-xl hover:bg-[#3ad2f1] transition-colors shadow-lg text-lg flex items-center justify-center gap-2"
               >
                 <span className="material-symbols-outlined">check_circle</span>
                 Mark as Complete
               </button>
            ) : (
                <button 
                 onClick={() => handleStatusChange(TaskStatus.InProgress)}
                 className="w-full bg-[#234248] text-white font-bold py-4 rounded-xl hover:bg-[#325e67] transition-colors shadow-lg text-lg"
               >
                 Mark as In-Progress
               </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudySessionModal;