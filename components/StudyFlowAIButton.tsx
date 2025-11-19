import React from 'react';
import { useAppContext } from '../context/AppContext';

const StudyFlowAIButton: React.FC = () => {
    const { isChatOpen, setIsChatOpen } = useAppContext();

    if (isChatOpen) {
        return null;
    }

    return (
        <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 z-40 flex items-center gap-3 h-14 pl-4 pr-6 bg-primary text-[#111f22] rounded-full shadow-lg hover:scale-105 transition-transform duration-200 animate-fade-in-up"
        >
            <span className="material-symbols-outlined" style={{fontSize: '28px'}}>psychology</span>
            <span className="font-bold">StudyFlow AI</span>
        </button>
    );
};

export default StudyFlowAIButton;
