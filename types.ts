export enum TaskStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'book' | 'interactive' | 'documentation' | 'course';
  rating?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: TaskStatus;
  resources: LearningResource[];
  subtopics?: string[];
  created_at?: string;
}

export interface Milestone {
  id: string;
  title: string;
  tasks: Task[];
  created_at?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  totalEstimatedHours: number;
  milestones: Milestone[];
  overallResources: LearningResource[];
  created_at?: string;
  user_id?: string;
  experienceLevel?: string;
  weeklyCommitment?: string;
  existingSkills?: string;
}

export interface Stats {
  id?: number;
  hoursStudied: number;
  roadmapsCompleted: number;
  currentStreak: number;
  user_id?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}