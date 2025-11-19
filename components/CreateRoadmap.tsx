import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoadmap } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { Roadmap } from '../types';
import Header from './Header';
import { useUser, SignInButton } from '@clerk/clerk-react';

const SelectionGroup: React.FC<{
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void
}> = ({ label, options, value, onChange }) => (
    <div className="flex flex-col gap-3">
        <p className="text-white text-base font-medium leading-normal">{label}</p>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${value === option
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white/5 text-text-secondary border-transparent hover:border-border-dark hover:text-white'
                        }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const CreateRoadmap: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Beginner');
    const [weeklyCommitment, setWeeklyCommitment] = useState('Moderate');
    const [existingSkills, setExistingSkills] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState('');
    const [generatedResult, setGeneratedResult] = useState<{ roadmap: Omit<Roadmap, 'id'>; sources: any[] } | null>(null);

    const { addRoadmap, setChatContext, isAuthenticated } = useAppContext();
    const navigate = useNavigate();
    const { user } = useUser();

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
            const result = await generateRoadmap(
                topic,
                setGenerationStatus,
                experienceLevel,
                weeklyCommitment,
                existingSkills
            );
            setGeneratedResult(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
            setGenerationStatus('');
        }
    };

    const handleSave = async () => {
        if (generatedResult) {
            setIsSaving(true);
            try {
                // Add the profile metadata to the roadmap before saving
                const roadmapToSave = {
                    ...generatedResult.roadmap,
                    experienceLevel,
                    weeklyCommitment,
                    existingSkills
                };
                const newRoadmap = await addRoadmap(roadmapToSave);
                navigate(`/roadmap/${newRoadmap.id}`);
            } catch (err) {
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
                <div className="w-full lg:w-1/3 xl:w-1/4 p-6 border-r border-gray-200/10 dark:border-white/10 flex flex-col gap-8 bg-surface-dark overflow-y-auto">
                    <div className="flex min-w-72 flex-col gap-3">
                        <p className="text-white text-3xl xl:text-4xl font-black leading-tight tracking-[-0.033em]">Create Your Learning Plan</p>
                        <p className="text-text-secondary text-base font-normal leading-normal">Enter your goal and let our AI build a custom learning path for you.</p>
                    </div>
                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col w-full">
                            <p className="text-white text-base font-medium leading-normal pb-2">Learning Goal</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-border-dark bg-background-dark focus:border-primary h-14 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                                placeholder="e.g., Learn Python for Data Science"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isLoading || isSaving}
                            />
                        </label>

                        <SelectionGroup
                            label="Your Experience Level"
                            options={['Beginner', 'Intermediate', 'Advanced']}
                            value={experienceLevel}
                            onChange={setExperienceLevel}
                        />

                        <SelectionGroup
                            label="Weekly Commitment"
                            options={['Light (2-4h)', 'Moderate (5-10h)', 'Intense (15h+)']}
                            value={weeklyCommitment}
                            onChange={setWeeklyCommitment}
                        />

                        <label className="flex flex-col w-full">
                            <p className="text-white text-base font-medium leading-normal pb-2">Existing Skills (Optional)</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-border-dark bg-background-dark focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-sm font-normal leading-normal"
                                placeholder="e.g., HTML, CSS, Basic JS"
                                value={existingSkills}
                                onChange={(e) => setExistingSkills(e.target.value)}
                                disabled={isLoading || isSaving}
                            />
                        </label>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || isSaving}
                        className="flex mt-auto w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] disabled:bg-gray-500 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
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
                            <p className="text-text-secondary text-base">
                                {generatedRoadmap ? `Est. ${generatedRoadmap.totalEstimatedHours} Hours` : "Awaiting generation..."}
                            </p>
                        </div>
                        {generatedRoadmap && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || isSaving}
                                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white/10 text-white text-sm font-medium disabled:opacity-50 hover:bg-white/20 transition-colors">
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span> Regenerate
                                </button>

                                {isAuthenticated ? (
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading || isSaving}
                                        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                                        {isSaving && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>}
                                        {isSaving ? "Saving..." : <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span> Save to Account</>}
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading || isSaving}
                                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors">
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span> Save Locally
                                        </button>
                                        <SignInButton mode="modal">
                                            <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cloud_upload</span> Sign in to Save
                                            </button>
                                        </SignInButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </header>
                    <div className="flex-1 rounded-xl bg-surface-dark p-8 overflow-auto relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '60px' }}>progress_activity</span>
                                <p className="mt-4 text-xl font-medium text-white">Crafting your learning journey...</p>
                                <p className="text-base text-text-secondary">{generationStatus}</p>
                            </div>
                        ) : generatedRoadmap ? (
                            <div className="animate-fade-in text-white">
                                <p className="text-text-secondary mt-2 mb-6">{generatedRoadmap.description}</p>

                                <div className="flex flex-wrap gap-4 mb-6">
                                    {experienceLevel && <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-border-dark">Level: {experienceLevel}</span>}
                                    {weeklyCommitment && <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-border-dark">Commitment: {weeklyCommitment}</span>}
                                </div>

                                <div className="mt-6 border-t border-border-dark pt-6">
                                    <h3 className="text-xl font-semibold mb-4">Main Topics Preview:</h3>
                                    <ul className="space-y-2 list-disc list-inside text-text-secondary">
                                        {generatedRoadmap.milestones.map(m => <li key={m.id}>{m.title}</li>)}
                                    </ul>
                                </div>
                                {generatedResult.sources && generatedResult.sources.length > 0 && (
                                    <div className="mt-6 border-t border-border-dark pt-6">
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