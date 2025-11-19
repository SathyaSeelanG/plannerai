
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoadmap } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { Roadmap } from '../types';
import Header from './Header';

const Slider: React.FC<{ label: string; valueLabel: string }> = ({ label, valueLabel }) => (
    <div className="@container">
        <div className="relative flex w-full flex-col items-start justify-between gap-3">
            <div className="flex w-full shrink-[3] items-center justify-between">
                <p className="text-white text-base font-medium leading-normal">{label}</p>
                <p className="text-white text-sm font-normal leading-normal @[480px]:hidden">{valueLabel}</p>
            </div>
            <div className="flex h-4 w-full items-center gap-4">
                <div className="flex h-1 flex-1 rounded-full bg-[#325e67]">
                    <div className="h-full w-[20%] rounded-full bg-primary"></div>
                    <div className="relative">
                        <div className="absolute -left-2 -top-1.5 size-4 rounded-full bg-primary border-2 border-[#111f22]"></div>
                    </div>
                </div>
                <p className="text-white text-sm font-normal leading-normal hidden @[480px]:block">{valueLabel}</p>
            </div>
        </div>
    </div>
);


const CreateRoadmap: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generatedResult, setGeneratedResult] = useState<{ roadmap: Omit<Roadmap, 'id'>; sources: any[] } | null>(null);
  const { addRoadmap, setChatContext } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    setChatContext({ type: 'create' });
    return () => setChatContext(null);
  }, [setChatContext]);


  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a learning topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedResult(null);
    setGenerationStatus("Initializing AI agents...");
    try {
      const result = await generateRoadmap(topic, setGenerationStatus);
      setGeneratedResult(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setGenerationStatus('');
    }
  };
  
  const handleSave = async () => {
    if(generatedResult) {
        setIsSaving(true);
        try {
            const newRoadmap = await addRoadmap(generatedResult.roadmap);
            navigate(`/roadmap/${newRoadmap.id}`);
        } catch(err) {
            console.error(err);
            setError("Failed to save the roadmap. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }
  }

  const generatedRoadmap = generatedResult?.roadmap;

  return (
    <>
      <Header title="Create Roadmap" />
      <div className="flex flex-1 flex-col lg:flex-row -m-6 lg:-m-10 h-full">
          {/* Left Panel */}
          <div className="w-full lg:w-1/3 xl:w-1/4 p-6 border-r border-gray-200/10 dark:border-white/10 flex flex-col gap-8 bg-[#111f22]">
              <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-white text-3xl xl:text-4xl font-black leading-tight tracking-[-0.033em]">Create Your Learning Plan</p>
                  <p className="text-[#92c0c9] text-base font-normal leading-normal">Enter your goal and let our AI build a custom learning path for you.</p>
              </div>
            <div className="flex flex-col gap-6">
                <label className="flex flex-col w-full">
                    <p className="text-white text-base font-medium leading-normal pb-2">Learning Goal</p>
                    <input 
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-[#325e67] bg-[#192f33] focus:border-primary h-14 placeholder:text-[#92c0c9] p-[15px] text-base font-normal leading-normal" 
                        placeholder="e.g., Learn Python for Data Science" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isLoading || isSaving}
                    />
                </label>
                <Slider label="Your Experience Level" valueLabel="Beginner" />
                <Slider label="Weekly Commitment" valueLabel="Moderate" />
            </div>
             <button 
                onClick={handleGenerate}
                disabled={isLoading || isSaving}
                className="flex mt-auto w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] disabled:bg-gray-500 disabled:cursor-not-allowed"
             >
                {isLoading ? (
                    <>
                       <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                       Generating...
                    </>
                ) : <span className="truncate">Generate Roadmap</span>}
            </button>
             {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        {/* Right Canvas */}
        <div className="w-full lg:w-2/3 xl:w-3/4 p-6 flex flex-col bg-background-dark">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col">
                    <h2 className="text-white text-2xl font-bold">{generatedRoadmap?.title || "Your Generated Roadmap"}</h2>
                    <p className="text-[#92c0c9] text-base">
                        {generatedRoadmap ? `Est. ${generatedRoadmap.totalEstimatedHours} Hours` : "Awaiting generation..."}
                    </p>
                </div>
                {generatedRoadmap && (
                    <div className="flex items-center gap-2 flex-wrap">
                         <button 
                            onClick={handleGenerate}
                            disabled={isLoading || isSaving}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#234248] text-white text-sm font-medium disabled:opacity-50">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span> Regenerate
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading || isSaving}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold">
                             {isSaving && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>}
                            {isSaving ? "Saving..." : <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span> Save</>}
                        </button>
                    </div>
                )}
            </header>
            <div className="flex-1 rounded-xl bg-[#111f22] p-8 overflow-auto relative">
                {isLoading ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '60px' }}>progress_activity</span>
                        <p className="mt-4 text-xl font-medium text-white">Crafting your learning journey...</p>
                        <p className="text-base text-[#92c0c9]">{generationStatus}</p>
                    </div>
                ) : generatedRoadmap ? (
                     <div className="animate-fade-in text-white">
                        <p className="text-[#92c0c9] mt-2 mb-6">{generatedRoadmap.description}</p>
                        <div className="mt-6 border-t border-[#325e67] pt-6">
                            <h3 className="text-xl font-semibold mb-4">Main Topics Preview:</h3>
                            <ul className="space-y-2 list-disc list-inside text-[#92c0c9]">
                                {generatedRoadmap.milestones.map(m => <li key={m.id}>{m.title}</li>)}
                            </ul>
                        </div>
                         {generatedResult.sources && generatedResult.sources.length > 0 && (
                            <div className="mt-6 border-t border-[#325e67] pt-6">
                                <h3 className="text-xl font-semibold mb-4">Sources</h3>
                                <ul className="space-y-2 list-disc list-inside text-sm">
                                {generatedResult.sources.map((source, index) =>
                                    source.web ? (
                                    <li key={index}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                         {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                    ) : null
                                )}
                                </ul>
                            </div>
                         )}
                     </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="text-center text-gray-500">
                            <span className="material-symbols-outlined" style={{ fontSize: '80px' }}>insights</span>
                            <p className="mt-4 text-xl font-medium">Your roadmap will appear here</p>
                            <p className="text-base text-gray-400">Enter a goal to generate your learning path.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default CreateRoadmap;