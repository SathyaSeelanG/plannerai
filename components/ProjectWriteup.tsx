
import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="bg-[#111f22] rounded-md p-4 my-4 overflow-x-auto border border-[#325e67]">
    <code className="text-sm text-[#92c0c9] font-mono">
      {children}
    </code>
  </pre>
);

const ProjectWriteup: React.FC = () => {
  const { setChatContext } = useAppContext();

  useEffect(() => {
    setChatContext({ type: 'writeup' });
    return () => setChatContext(null);
  }, [setChatContext]);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 text-white animate-fade-in">
      <h1 className="text-4xl font-bold text-primary mb-2">Gemini Roadmap Planner: Capstone Project Write-up</h1>
      <p className="text-lg text-[#92c0c9] mb-8">An AI-powered "Agent for Good" designed to democratize education by creating personalized, structured learning paths.</p>

      {/* Category 1: The Pitch */}
      <div className="bg-[#111f22] p-6 rounded-lg mb-8 border border-[#325e67]">
        <h2 className="text-3xl font-bold mb-4 border-b border-[#325e67] pb-2">Category 1: The Pitch</h2>
        
        <h3 className="text-2xl font-semibold text-primary/80 mt-6 mb-2">The Problem</h3>
        <p className="mb-4 text-[#92c0c9]">
          In the age of information abundance, aspiring learners face a "paradox of choice." While millions of tutorials exist on YouTube and the web, structuring them into a coherent curriculum is difficult. Self-learners often get stuck in "tutorial hell," unsure of prerequisites, what to learn next, or which resources are actually high-quality and up-to-date. This lack of structure leads to high dropout rates and wasted time.
        </p>

        <h3 className="text-2xl font-semibold text-primary/80 mt-6 mb-2">Our Solution: An AI Curriculum Architect</h3>
        <p className="mb-4 text-[#92c0c9]">
          <strong>Gemini Roadmap Planner</strong> is an intelligent application that acts as a personal curriculum designer. By simply entering a learning goal (e.g., "Learn Python for Data Science"), the application employs a multi-agent system to:
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-4 text-[#92c0c9]">
            <li><strong>Structure Knowledge:</strong> Break down complex topics into logical Milestones (Main Topics) and Tasks (Sub-topics).</li>
            <li><strong>Curate Resources:</strong> Actively search the live web for the best-rated YouTube videos, articles, and courses for <em>each specific task</em>.</li>
            <li><strong>Guide Learning:</strong> Provide an always-available "StudyFlow AI" tutor that knows exactly what task the user is working on.</li>
        </ol>
        
        <h3 className="text-2xl font-semibold text-primary/80 mt-6 mb-2">Core Value & Impact</h3>
        <p className="text-[#92c0c9]">
          This project democratizes access to structured education. It transforms a vague intent ("I want to learn X") into a concrete, actionable plan with verified resources. It leverages the <strong>Gemini 2.5 Flash</strong> model's speed and tool-use capabilities to create a learning experience that is personalized, current, and free.
        </p>
      </div>

      {/* Category 2: The Implementation */}
      <div className="bg-[#111f22] p-6 rounded-lg mb-8 border border-[#325e67]">
        <h2 className="text-3xl font-bold mb-4 border-b border-[#325e67] pb-2">Category 2: The Implementation</h2>
        
        <h3 className="text-2xl font-semibold text-primary/80 mt-6 mb-2">Tech Stack</h3>
        <ul className="list-disc list-inside space-y-2 mb-4 text-[#92c0c9]">
            <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS (Modern UI/UX).</li>
            <li><strong>AI Engine:</strong> Google GenAI SDK (<code>@google/genai</code>), Model: <code>gemini-2.5-flash</code>.</li>
            <li><strong>Database:</strong> Supabase (PostgreSQL) for persisting roadmaps, task status, and user stats.</li>
            <li><strong>Tools:</strong> Google Search Tool (Grounding) for resource curation.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-primary/80 mt-6 mb-2">Key Concepts Demonstrated</h3>

        <div className="mt-6 border-t border-[#325e67] pt-4">
            <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">group_work</span> 1. Multi-agent System (Sequential & Parallel)</h4>
            <p className="mb-2 text-[#92c0c9]">
                The application relies on a sophisticated orchestration of two specialized agents. We do not ask a single prompt to "do everything." Instead, we split the cognitive load:
            </p>
            <ul className="list-decimal list-inside space-y-2 my-4 pl-4 text-[#92c0c9]">
                <li>
                    <strong>The Architect Agent:</strong> A "Structured Output" agent. It receives the topic and uses a strict JSON schema to generate the hierarchy of Milestones and Tasks. It focuses purely on pedagogical structure, not resource finding.
                </li>
                <li>
                    <strong>The Resource Curator Agent:</strong> A "Tool-Use" agent. Once the structure is built, this agent is spawned <em>in parallel</em> for every single task. It receives the specific task title and description and uses Google Search to find rated resources.
                </li>
            </ul>
            <CodeBlock>{`
// Orchestration Logic (services/geminiService.ts)

// 1. ARCHITECT: Generate the JSON Skeleton
const architectPrompt = \`Create a roadmap structure for "\${topic}"...\`;
const structure = await callStructuredModel(architectPrompt, architectSchema);

// 2. CURATOR: Parallel execution for every task
const resourcePromises = allTasks.map(task => {
   const curatorPrompt = \`Find 5-7 rated resources for sub-topic: "\${task.title}"...\`;
   return callToolEnabledModel(curatorPrompt); // Uses Google Search
});

// 3. MERGE: Combine structure + resources
const finalRoadmap = mergeResults(structure, await Promise.all(resourcePromises));
            `}</CodeBlock>
        </div>

        <div className="mt-6 border-t border-[#325e67] pt-4">
            <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">travel_explore</span> 2. Tools (Google Search Grounding)</h4>
            <p className="mb-2 text-[#92c0c9]">
                Static knowledge cuts off. To ensure our learners get the latest documentation and tutorials (e.g., "React 19 features"), the **Resource Curator** and **StudyFlow AI** agents are equipped with the `googleSearch` tool.
            </p>
            <p className="mb-2 text-[#92c0c9]">
                This allows the model to fetch real URLs, titles, and context from the live web, preventing hallucinations about non-existent links.
            </p>
            <CodeBlock>{`
// Tool Configuration
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
  config: {
    tools: [{ googleSearch: {} }], // Enables live web access
    responseMimeType: "application/json" // Requests JSON format for easy parsing
  },
});
            `}</CodeBlock>
        </div>

        <div className="mt-6 border-t border-[#325e67] pt-4">
            <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">psychology</span> 3. Context Engineering & State</h4>
            <p className="mb-2 text-[#92c0c9]">
                The "StudyFlow AI" chat assistant isn't a generic chatbot. It is <strong>Context-Aware</strong>. The application injects the specific state of the user's journey into the system instruction dynamically.
            </p>
            <ul className="list-disc list-inside space-y-2 my-4 pl-4 text-[#92c0c9]">
                <li>If you are on the <strong>Dashboard</strong>, it knows your stats and streaks.</li>
                <li>If you are viewing a <strong>Roadmap</strong>, it knows the Milestones.</li>
                <li>If you are viewing a <strong>Task</strong>, it knows the specific sub-topics and description of that task.</li>
            </ul>
            <CodeBlock>{`
// Dynamic System Instruction (services/geminiService.ts)

if (context?.type === 'task') {
   systemInstruction = \`You are StudyFlow AI. The user is studying "\${context.data.task.title}". 
   Subtopics: \${context.data.task.subtopics.join(', ')}.
   If they ask for help, explain these specific subtopics.\`;
} else if (context?.type === 'dashboard') {
   systemInstruction = \`Help the user analyze their study stats...\`;
}
            `}</CodeBlock>
        </div>

        <div className="mt-6 border-t border-[#325e67] pt-4">
            <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">data_object</span> 4. Structured Output (JSON Schema)</h4>
            <p className="mb-2 text-[#92c0c9]">
                To render a beautiful UI, we cannot rely on unstructured text. We use Gemini's `responseSchema` configuration to guarantee that the **Architect Agent** returns a strictly formatted JSON object containing arrays of Milestones and Tasks. This allows the React frontend to map over the data confidently without parsing errors.
            </p>
             <CodeBlock>{`
// Schema Definition
const architectSchema = {
  type: Type.OBJECT,
  properties: {
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tasks: { type: Type.ARRAY, ... }
        }
      }
    }
  }
};
            `}</CodeBlock>
        </div>
      </div>
      
      <div className="bg-[#111f22] p-6 rounded-lg mb-8 border border-[#325e67]">
        <h2 className="text-3xl font-bold mb-4 border-b border-[#325e67] pb-2">Video Presentation</h2>
        <p className="text-[#92c0c9] mb-4">
            [Placeholder for video submission link. A 3-minute walkthrough demonstrating the roadmap generation, the resource curation in action, and the context-aware chat.]
        </p>
      </div>

    </div>
  );
};

export default ProjectWriteup;
