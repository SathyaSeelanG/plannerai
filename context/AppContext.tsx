import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Roadmap, Stats, TaskStatus, Milestone, User } from '../types';
import { supabase, supabaseError } from '../services/supabaseClient';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  roadmaps: Roadmap[];
  stats: Stats;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  configurationError: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  addRoadmap: (roadmap: Omit<Roadmap, 'id'>) => Promise<Roadmap>;
  updateTaskStatus: (roadmapId: string, milestoneId: string, taskId: string, status: TaskStatus, hours: number) => Promise<void>;
  getRoadmapById: (id: string) => Roadmap | undefined;
  fetchRoadmaps: () => void;
  saveToAccount: () => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatContext: any;
  setChatContext: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [stats, setStats] = useState<Stats>({ hoursStudied: 0, roadmapsCompleted: 0, currentStreak: 0 });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<any>(null);
  
  // Local storage for guest users
  const [localRoadmaps, setLocalRoadmaps] = useLocalStorage<Roadmap[]>('guest_roadmaps', []);
  const [localStats, setLocalStats] = useLocalStorage<Stats>('guest_stats', { hoursStudied: 0, roadmapsCompleted: 0, currentStreak: 0 });

  const isConfigured = !!supabase;
  const configurationError = supabaseError;
  const isAuthenticated = isSignedIn || false;
  const isGuest = !isAuthenticated && isLoaded;

  const fetchRoadmaps = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && supabase && clerkUser) {
        // Fetch from Supabase for authenticated users, filtered by user ID
        const { data, error } = await supabase
          .from('roadmaps')
          .select(`*, milestones(*, tasks(*))`)
          .eq('user_id', clerkUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRoadmaps(data || []);
      } else {
        // Use local storage for guest users
        setRoadmaps(localRoadmaps);
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, localRoadmaps, clerkUser]);

  const fetchStats = useCallback(async () => {
    try {
      if (isAuthenticated && supabase && clerkUser) {
        const { data, error } = await supabase
          .from('stats')
          .select('*')
          .eq('user_id', clerkUser.id)
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        if (data) {
          setStats(data);
        } else {
          // Create initial stats for new user
          const initialStats = { hoursStudied: 0, roadmapsCompleted: 0, currentStreak: 0 };
          const { error: insertError } = await supabase
            .from('stats')
            .insert({ ...initialStats, user_id: clerkUser.id });
          if (!insertError) setStats(initialStats);
        }
      } else {
        // Use local storage for guest users
        setStats(localStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [isAuthenticated, localStats, clerkUser]);

  const fetchUser = useCallback(() => {
    if (clerkUser) {
      setUser({
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}` || 'User',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        avatarUrl: clerkUser.imageUrl
      });
    } else {
      setUser(null);
    }
  }, [clerkUser]);

  useEffect(() => {
    if (isLoaded) {
      fetchUser();
      fetchRoadmaps();
      fetchStats();
    }
  }, [isLoaded, isAuthenticated, fetchUser, fetchRoadmaps, fetchStats]);

  const addRoadmap = async (newRoadmapData: Omit<Roadmap, 'id'>): Promise<Roadmap> => {
    if (isAuthenticated && supabase && clerkUser) {
      // Save to Supabase for authenticated users
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          title: newRoadmapData.title,
          description: newRoadmapData.description,
          totalEstimatedHours: newRoadmapData.totalEstimatedHours,
          overallResources: newRoadmapData.overallResources,
          user_id: clerkUser.id,
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      const createdMilestones: Milestone[] = [];
      for (const milestone of newRoadmapData.milestones) {
        const { data: milestoneData, error: milestoneError } = await supabase
          .from('milestones')
          .insert({
            title: milestone.title,
            roadmap_id: roadmapData.id,
          })
          .select()
          .single();
        
        if (milestoneError) throw milestoneError;

        const tasksToInsert = milestone.tasks.map(task => {
            const { id, ...taskWithoutId } = task;
            return {
                ...taskWithoutId,
                milestone_id: milestoneData.id,
                status: TaskStatus.NotStarted
            };
        });

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();
        
        if (tasksError) throw tasksError;

        createdMilestones.push({ ...milestoneData, tasks: tasksData });
      }
      
      const newRoadmap = { ...roadmapData, milestones: createdMilestones };
      setRoadmaps(prev => [newRoadmap, ...prev]);
      return newRoadmap;
    } else {
      // Save to local storage for guest users
      const guestId = `guest_${Date.now()}`;
      const newRoadmap: Roadmap = {
        ...newRoadmapData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        user_id: guestId,
        milestones: newRoadmapData.milestones.map((milestone, mIndex) => ({
          ...milestone,
          id: `${Date.now()}-${mIndex}`,
          roadmap_id: Date.now().toString(),
          tasks: milestone.tasks.map((task, tIndex) => ({
            ...task,
            id: `${Date.now()}-${mIndex}-${tIndex}`,
            milestone_id: `${Date.now()}-${mIndex}`,
            status: TaskStatus.NotStarted
          }))
        }))
      };
      
      const updatedRoadmaps = [newRoadmap, ...localRoadmaps];
      setLocalRoadmaps(updatedRoadmaps);
      setRoadmaps(updatedRoadmaps);
      return newRoadmap;
    }
  };

  const updateTaskStatus = async (roadmapId: string, milestoneId: string, taskId: string, status: TaskStatus, hours: number) => {
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    if (!roadmap) return;
    
    const milestone = roadmap.milestones.find(m => m.id === milestoneId);
    if(!milestone) return;

    const task = milestone.tasks.find(t => t.id === taskId);
    if(!task) return;

    if (isAuthenticated && supabase) {
      // Update in Supabase for authenticated users
      const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
      if (error) {
        console.error('Error updating task status:', error);
        return;
      }
    }
    
    const updatedRoadmaps = roadmaps.map(r => {
      if (r.id === roadmapId) {
          return {
              ...r,
              milestones: r.milestones.map(m => {
                  if (m.id === milestoneId) {
                      return {
                          ...m,
                          tasks: m.tasks.map(t => t.id === taskId ? { ...t, status } : t)
                      }
                  }
                  return m;
              })
          }
      }
      return r;
    });
    
    setRoadmaps(updatedRoadmaps);
    
    if (!isAuthenticated) {
      // Update local storage for guest users
      setLocalRoadmaps(updatedRoadmaps);
    }

    let hoursChange = 0;
    if (task.status !== TaskStatus.Completed && status === TaskStatus.Completed) {
        hoursChange = hours;
    } else if (task.status === TaskStatus.Completed && status !== TaskStatus.Completed) {
        hoursChange = -hours;
    }

    if (hoursChange !== 0) {
      if (isAuthenticated && supabase && clerkUser) {
        // Update stats in Supabase for authenticated users
        const { data: currentStats } = await supabase
          .from('stats')
          .select('*')
          .eq('user_id', clerkUser.id)
          .single();
        
        if (currentStats) {
          await supabase
            .from('stats')
            .update({ hoursStudied: currentStats.hoursStudied + hoursChange })
            .eq('user_id', clerkUser.id);
        }
        await fetchStats();
      } else {
        // Update local stats for guest users
        const newStats = { ...localStats, hoursStudied: localStats.hoursStudied + hoursChange };
        setLocalStats(newStats);
        setStats(newStats);
      }
    }
    
    const updatedRoadmap = updatedRoadmaps.find(r => r.id === roadmapId);
    if (updatedRoadmap) {
        const allTasksCompleted = updatedRoadmap.milestones.every(m => m.tasks.every(t => t.status === TaskStatus.Completed));
        if (allTasksCompleted) {
          if (isAuthenticated && supabase && clerkUser) {
            // Update completed roadmaps count in Supabase
            const { data: currentStats } = await supabase
              .from('stats')
              .select('*')
              .eq('user_id', clerkUser.id)
              .single();
            
            if (currentStats) {
              await supabase
                .from('stats')
                .update({ roadmapsCompleted: currentStats.roadmapsCompleted + 1 })
                .eq('user_id', clerkUser.id);
            }
            await fetchStats();
          } else {
            // Update local stats for guest users
            const newStats = { ...localStats, roadmapsCompleted: localStats.roadmapsCompleted + 1 };
            setLocalStats(newStats);
            setStats(newStats);
          }
        }
    }
  };

  const saveToAccount = async () => {
    if (!isAuthenticated || !supabase || !clerkUser || localRoadmaps.length === 0) return;
    
    try {
      // Save all local roadmaps to the user's account
      for (const roadmap of localRoadmaps) {
        await addRoadmap({
          title: roadmap.title,
          description: roadmap.description,
          totalEstimatedHours: roadmap.totalEstimatedHours,
          overallResources: roadmap.overallResources,
          milestones: roadmap.milestones
        });
      }
      
      // Migrate local stats to account
      if (localStats.hoursStudied > 0 || localStats.roadmapsCompleted > 0) {
        await supabase
          .from('stats')
          .upsert({
            user_id: clerkUser.id,
            hoursStudied: localStats.hoursStudied,
            roadmapsCompleted: localStats.roadmapsCompleted,
            currentStreak: localStats.currentStreak
          });
      }
      
      // Clear local storage after successful save
      setLocalRoadmaps([]);
      setLocalStats({ hoursStudied: 0, roadmapsCompleted: 0, currentStreak: 0 });
      
      // Fetch updated data from Supabase
      await fetchRoadmaps();
      await fetchStats();
    } catch (error) {
      console.error('Error saving to account:', error);
      throw error;
    }
  };
  
  const getRoadmapById = (id: string): Roadmap | undefined => {
      return roadmaps.find(r => r.id === id);
  }

  return (
    <AppContext.Provider value={{ 
        roadmaps, stats, user, isLoading, isConfigured, configurationError,
        isAuthenticated, isGuest,
        addRoadmap, updateTaskStatus, getRoadmapById, fetchRoadmaps, saveToAccount,
        isChatOpen, setIsChatOpen, chatContext, setChatContext 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};