import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, ChatMessage, TaskStatus, Task, Milestone, LearningResource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const is503 = error.status === 503 || error.code === 503 || (error.message && (error.message.includes('503') || error.message.includes('overloaded')));

      if (is503 && i < retries - 1) {
        console.warn(`Attempt ${i + 1} failed with 503/Overloaded. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        if (i === retries - 1 && is503) {
          console.error(`Operation failed after ${retries} attempts due to 503/Overloaded.`);
        }
        throw error;
      }
    }
  }
  throw new Error("Unexpected retry loop exit");
};

// --- Agent 1: The Architect ---
// This agent is responsible for creating the high-level structure of the roadmap.
const architectSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    totalEstimatedHours: { type: Type.NUMBER },
    overallResources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          type: { type: Type.STRING, description: "Can be 'course', 'book', or 'documentation'." },
          rating: { type: Type.NUMBER, description: "A quality score from 1.0 to 5.0 based on relevance and authority." }
        },
        required: ['title', 'url', 'type', 'rating']
      }
    },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER },
                subtopics: {
                  type: Type.ARRAY,
                  description: "A list of 2-5 key sub-topics or specific concepts to cover within this task.",
                  items: { type: Type.STRING }
                }
              },
              required: ['id', 'title', 'description', 'estimatedHours']
            }
          }
        },
        required: ['id', 'title', 'tasks']
      }
    }
  },
  required: ['title', 'description', 'totalEstimatedHours', 'milestones', 'overallResources']
};

// --- Agent 2: The Resource Curator ---
// This agent finds specific resources for a single task.
const curatorSchema = {
  type: Type.OBJECT,
  properties: {
    resources: {
      type: Type.ARRAY,
      description: "A list of 5-7 diverse, high-quality learning resources for this specific task.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          type: { type: Type.STRING, description: "Can be 'video', 'article', 'documentation', 'course', 'interactive', or 'book'." },
          rating: { type: Type.NUMBER, description: "A quality score from 1.0 to 5.0 based on relevance, depth, and authority." }
        },
        required: ['title', 'url', 'type', 'rating']
      }
    }
  },
  required: ['resources']
};


// Model caller for agents that need a structured JSON response without tools.
const callStructuredModel = async (prompt: string, schema: object) => {
  const response = await retryOperation(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  }));

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse JSON from structured model:", response.text);
    throw new Error("The AI returned an invalid data structure.");
  }
}

// Model caller for agents that need tools (like Google Search).
// It instructs the model to return JSON in the prompt and parses the response.
const callToolEnabledModel = async (prompt: string) => {
  const response = await retryOperation(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  }));

  try {
    const text = response.text.trim();
    // The model might return markdown with a json block. Extract it.
    const jsonMatch = text.match(/```(json)?\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[2] : text;
    const parsedJson = JSON.parse(jsonText);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { json: parsedJson, sources };
  } catch (e) {
    console.error("Failed to parse JSON from tool-enabled model:", response.text);
    throw new Error("The AI returned an invalid data structure from the tool-enabled call.");
  }
}


export const generateRoadmap = async (
  topic: string,
  onProgress: (status: string) => void,
  experienceLevel: string = 'Beginner',
  weeklyCommitment: string = 'Moderate',
  existingSkills: string = ''
): Promise<{ roadmap: Omit<Roadmap, 'id'>; sources: any[] }> => {
  try {
    // === Step 1: Call Architect Agent to get roadmap structure ===
    onProgress("Step 1/2: Designing roadmap structure...");
    const architectPrompt = `You are an expert curriculum designer. Create a detailed learning roadmap structure for the topic: "${topic}".
    
    User Profile:
    - Experience Level: ${experienceLevel}
    - Weekly Commitment: ${weeklyCommitment}
    ${existingSkills ? `- Existing Skills: ${existingSkills}` : ''}

    The roadmap should be tailored to this profile.
    - If Beginner: Focus on fundamentals and build up slowly.
    - If Intermediate/Advanced: Skip basics if covered by existing skills, focus on advanced concepts.
    - Adjust the depth and number of tasks based on the weekly commitment.

    The roadmap should be broken down into logical milestones, which represent the **Main Topics** of the subject. Each milestone must contain specific, actionable tasks, which represent the **Sub-topics** to be learned within that Main Topic.
    Provide 2-3 high-level 'overallResources' (like full courses or books) and assign them a relevance rating (1.0-5.0).
    For each task, provide a title, description, estimated hours, and a list of key subtopics.
    Do NOT generate task-specific resources; that will be handled by another agent.
    The entire output MUST be a single JSON object that strictly adheres to the provided schema.`;

    const roadmapStructure: Omit<Roadmap, 'id'> = await callStructuredModel(architectPrompt, architectSchema);

    const allTasks: { task: Task, milestoneId: string }[] = roadmapStructure.milestones.flatMap(m => m.tasks.map(t => ({ task: t, milestoneId: m.id })));

    // === Step 2: Call Resource Curator Agent for each task in parallel ===
    onProgress(`Step 2/2: Curating resources for ${allTasks.length} tasks...`);

    const allSources = new Set<string>();

    const resourcePromises = allTasks.map(({ task }, index) => {
      const curatorPrompt = `You are an expert Resource Curator. Your task is to find 5-7 of the best, most relevant, and up-to-date learning resources for the following sub-topic:
- Sub-topic Title: "${task.title}"
- Sub-topic Description: "${task.description}"

Use your search tool to find a diverse mix of high-quality resources. Prioritize the following types:
1. In-depth YouTube video tutorials or series.
2. Comprehensive online courses (from platforms like Coursera, Udemy, freeCodeCamp, etc.).
3. Official documentation or key articles from reputable sources.
4. Interactive tutorials or exercises.

Assign a 'rating' (1.0 to 5.0) to each resource based on its quality, comprehensiveness, and user feedback if available.

You MUST format your findings as a single JSON object inside a markdown code block. The JSON object must strictly adhere to the following schema:
Schema: ${JSON.stringify(curatorSchema, null, 2)}`;

      return callToolEnabledModel(curatorPrompt).then(result => {
        onProgress(`Step 2/2: Curating resources... (${index + 1}/${allTasks.length} tasks complete)`);
        result.sources.forEach((source: any) => allSources.add(JSON.stringify(source)));
        return { taskId: task.id, resources: result.json.resources };
      }).catch(error => {
        console.error(`Failed to get resources for task "${task.title}":`, error);
        // Return empty resources on failure to avoid breaking the whole process
        return { taskId: task.id, resources: [] };
      });
    });

    const taskResources = await Promise.all(resourcePromises);
    const resourcesMap = new Map<string, LearningResource[]>(taskResources.map(tr => [tr.taskId, tr.resources]));

    // === Step 3: Combine the structure and the resources ===
    onProgress("Finalizing your roadmap...");
    const finalRoadmap = {
      ...roadmapStructure,
      milestones: roadmapStructure.milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => ({
          ...task,
          status: TaskStatus.NotStarted,
          resources: resourcesMap.get(task.id) || []
        }))
      }))
    };

    const uniqueSources = Array.from(allSources).map(s => JSON.parse(s));
    return { roadmap: finalRoadmap, sources: uniqueSources };

  } catch (error) {
    console.error("Error generating roadmap:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
    throw new Error("An unknown error occurred during roadmap generation.");
  }
};


export const getChatResponse = async (history: ChatMessage[], newMessage: string, context: any): Promise<string> => {
  try {
    let systemInstruction = `You are "StudyFlow AI", a helpful and encouraging AI study assistant. Answer the user's questions concisely. Provide encouragement and helpful advice. Keep responses under 200 words. Format your response in markdown. You have access to Google Search. If the user asks for additional resources (videos, articles, courses), use the search tool to find high-quality, up-to-date links.`;

    if (context?.type === 'roadmap' && context.data) {
      const roadmap = context.data as Roadmap;
      systemInstruction = `You are "StudyFlow AI", a helpful AI study assistant. 
            The user is working on a roadmap for "${roadmap.title}".
            Milestones: ${roadmap.milestones.map(m => m.title).join(', ')}.
            
            If the user asks for resources, use Google Search to find relevant YouTube videos, articles, or courses specifically for this roadmap's topic.
            Answer concisely.`;
    } else if (context?.type === 'task' && context.data) {
      const { task, roadmapTitle } = context.data;
      systemInstruction = `You are "StudyFlow AI". The user is studying a specific task: "${task.title}" (Roadmap: ${roadmapTitle}).
             Description: ${task.description}.
             Subtopics: ${task.subtopics?.join(', ')}.
             
             If the user asks for help, explain the concept simply.
             If the user asks for resources, use Google Search to find YouTube tutorials, documentation, or articles specifically for "${task.title}".
             `;
    } else if (context?.type === 'dashboard') {
      systemInstruction = `You are "StudyFlow AI". The user is on their dashboard. Help them analyze their stats or suggest what to study next.`;
    } else if (context?.type === 'create') {
      systemInstruction = `You are "StudyFlow AI". The user is creating a new roadmap. Help them brainstorm topics.`;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const response = await retryOperation(() => chat.sendMessage({ message: newMessage }));
    return response.text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error("Failed to get chat response.");
  }
};