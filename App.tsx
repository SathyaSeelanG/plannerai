
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isChatOpen } = useAppContext();

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-6 lg:p-10 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} ${isChatOpen ? 'lg:mr-[400px]' : 'mr-0'}`}>
        <div className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateRoadmap />} />
            <Route path="/roadmap/:id" element={<RoadmapView />} />
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
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </AppContextProvider>
    </ClerkProviderWrapper>
  );
};

export default App;