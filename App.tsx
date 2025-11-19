import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { ClerkProviderWrapper } from './components/ClerkProviderWrapper';
import Dashboard from './components/Dashboard';
import CreateRoadmap from './components/CreateRoadmap';
import { RoadmapView } from './components/RoadmapView';
import ProjectWriteup from './components/ProjectWriteup';
import Sidebar from './components/Sidebar';
import StudyFlowAIButton from './components/StudyFlowAIButton';
import AIChatSidebar from './components/AIChatSidebar';
import Header from './components/Header';


const AppLayout: React.FC = () => {
  // Initialize sidebar state based on screen width
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isChatOpen } = useAppContext();

  return (
    <div className="flex h-full min-h-screen flex-col md:flex-row bg-background-light dark:bg-background-dark bg-dot-pattern dark:bg-dot-pattern-dark bg-[size:20px_20px]">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface-dark border-b border-border-dark sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">PlannerAI</span>
        </div>
        {/* Placeholder for potential mobile actions */}
      </div>

      <main className={`flex-1 p-4 md:p-6 lg:p-10 transition-all duration-300 w-full`}>
        <div className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateRoadmap />} />
            <Route path="/roadmap/:id" element={<RoadmapView />} />
            <Route path="/share/roadmap/:id" element={<RoadmapView />} />
            <Route path="/writeup" element={<ProjectWriteup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      <StudyFlowAIButton />
      <AIChatSidebar />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ClerkProviderWrapper>
      <AppContextProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AppContextProvider>
    </ClerkProviderWrapper>
  );
};

export default App;