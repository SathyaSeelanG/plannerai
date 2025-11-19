
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const NavLink: React.FC<{ to: string; icon: string; label: string, isSidebarOpen: boolean }> = ({ to, icon, label, isSidebarOpen }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} title={label} className="block">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${isActive ? 'bg-primary/20 dark:bg-[#234248]' : 'hover:bg-primary/10 dark:hover:bg-[#234248]/50'}`}>
                <span className={`material-symbols-outlined text-gray-700 dark:text-white ${isActive && 'fill'}`} >{icon}</span>
                <p className={`text-gray-700 dark:text-white text-sm font-medium leading-normal transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100 whitespace-nowrap' : 'opacity-0'}`}>{label}</p>
            </div>
        </Link>
    );
}

interface SidebarProps {
    isSidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
    const { user } = useAppContext();

    return (
        <aside className={`hidden md:flex flex-col bg-[#f0f2f2] dark:bg-[#111f22] p-4 border-r border-gray-200 dark:border-[#325e67] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex-grow">
                 <div className="flex items-center pb-4" style={{justifyContent: isSidebarOpen ? 'space-between' : 'center'}}>
                    {isSidebarOpen && user && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex-shrink-0" style={{ backgroundImage: `url("${user.avatarUrl}")` }}></div>
                        </div>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)} 
                        title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                        className="p-2 rounded-full text-gray-700 dark:text-white hover:bg-primary/10 dark:hover:bg-[#234248]/50"
                    >
                        {isSidebarOpen ? <span className="material-symbols-outlined">chevron_left</span> : <span className="material-symbols-outlined">menu</span>}
                    </button>
                 </div>
                
                <div className="pb-4">
                    <Link to="/create">
                        <button className="flex w-full items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-gray-900 dark:text-[#111f22] text-sm font-bold leading-normal tracking-[0.015em]">
                            {isSidebarOpen ? (
                                <span className="truncate">New Roadmap</span>
                            ) : (
                                <span className="material-symbols-outlined">add</span>
                            )}
                        </button>
                    </Link>
                </div>
                
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-[#325e67]">
                   <NavLink to="/" icon="dashboard" label="Dashboard" isSidebarOpen={isSidebarOpen} />
                   <NavLink to="/writeup" icon="article" label="Project Write-up" isSidebarOpen={isSidebarOpen} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;