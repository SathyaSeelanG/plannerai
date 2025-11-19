import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser, SignInButton } from "@clerk/clerk-react";
import { useAppContext } from '../context/AppContext';

const NavLink: React.FC<{
    to: string;
    icon: string;
    label: string;
    isSidebarOpen: boolean;
    onClick?: () => void;
    isPrimary?: boolean;
}> = ({ to, icon, label, isSidebarOpen, onClick, isPrimary }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} title={label} className="block" onClick={onClick}>
            <div className={`
                flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }
                ${isPrimary && !isActive && 'text-primary hover:bg-primary/10'}
            `}>
                <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`} >{icon}</span>
                <p className={`text-sm font-medium leading-normal transition-all duration-200 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4 hidden'}`}>{label}</p>
            </div>
        </Link>
    );
}

interface SidebarProps {
    isSidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
    const { user, isLoaded } = useUser();
    const { isAuthenticated } = useAppContext();

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`
                fixed md:sticky md:top-0 z-50 h-full md:h-screen flex flex-col
                bg-surface-dark border-r border-border-dark
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
            `}>
                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border-dark">
                    <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isSidebarOpen && 'md:justify-center md:w-full'}`}>
                        {/* Window Controls / Logo Icon */}
                        <div className="flex gap-1.5 shrink-0">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>

                        <span className={`font-bold text-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            PlannerAI
                        </span>
                    </div>
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-white/5 hover:text-white transition-colors ${!isSidebarOpen && 'hidden'}`}
                    >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <NavLink
                        to="/"
                        icon="dashboard"
                        label="Dashboard"
                        isSidebarOpen={isSidebarOpen}
                    />
                    <NavLink
                        to="/create"
                        icon="add_circle"
                        label="New Roadmap"
                        isSidebarOpen={isSidebarOpen}
                        isPrimary
                    />
                    <div className="pt-4 pb-2">
                        <p className={`px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider transition-opacity duration-200 ${!isSidebarOpen ? 'hidden' : 'block'}`}>
                            Resources
                        </p>
                        <div className={`h-px bg-border-dark mx-4 my-2 ${isSidebarOpen ? 'hidden' : 'md:block'}`}></div>
                    </div>
                    <NavLink
                        to="/writeup"
                        icon="description"
                        label="Project Write-up"
                        isSidebarOpen={isSidebarOpen}
                    />
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-border-dark">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'} md:justify-start`}>
                        {isAuthenticated ? (
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9"
                                    }
                                }}
                            />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-white transition-colors">
                                    <span className="material-symbols-outlined text-sm">login</span>
                                </button>
                            </SignInButton>
                        )}

                        <div className={`flex flex-col overflow-hidden transition-all duration-200 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                            {isAuthenticated ? (
                                <>
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.fullName || user?.username}
                                    </p>
                                    <p className="text-xs text-text-secondary truncate">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </p>
                                </>
                            ) : (
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-white hover:text-primary text-left">
                                        Sign In
                                    </button>
                                </SignInButton>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;