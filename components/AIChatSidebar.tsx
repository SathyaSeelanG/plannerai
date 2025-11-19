
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

// A more robust markdown parser
const parseMarkdown = (text: string) => {
    let html = text
        // escape html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g,
        '<pre class="bg-gray-800 rounded-md p-3 my-2 text-sm font-mono overflow-x-auto"><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-1 rounded-md font-mono text-sm">$1</code>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^\s*[-*]\s+(.*)/gm, '<ul class="list-disc list-inside my-1"><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul class="list-disc list-inside my-1">/g, ''); // Merge consecutive lists

    // Ordered lists
    html = html.replace(/^\s*\d+\.\s+(.*)/gm, '<ol class="list-decimal list-inside my-1"><li>$1</li></ol>');
    html = html.replace(/<\/ol>\n<ol class="list-decimal list-inside my-1">/g, ''); // Merge consecutive lists

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    // Newlines
    html = html.replace(/\n/g, '<br />');
    html = html.replace(/<br \/><(ul|ol|li|pre|code)/g, '<$1'); // fix extra space
    html = html.replace(/<\/(ul|ol|pre|code)><br \/>/g, '</$1>'); // fix extra space

    return html;
};


const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="size-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary-foreground">psychology</span>
                </div>
            )}
            <div className={`max-w-lg rounded-lg px-4 py-2 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-gray-800'}`}>
                <div className="text-sm text-white" dangerouslySetInnerHTML={{
                    __html: parseMarkdown(message.text || '')
                }} />
            </div>
        </div>
    );
};

const getSuggestedQuestions = (type: string | undefined, data: any): string[] => {
    switch (type) {
        case 'task':
            return [
                "Explain this concept simply",
                "Give me a real-world example",
                "Find YouTube tutorials",
                "Quiz me on this topic"
            ];
        case 'roadmap':
            return [
                `Summarize the learning path`,
                "Suggest a project idea",
                "What are the prerequisites?",
                "Find extra video courses"
            ];
        case 'dashboard':
            return [
                "Analyze my study habits",
                "What should I focus on?",
                "Suggest a new topic to learn",
                "How to stay motivated?"
            ];
        case 'create':
            return [
                "Trending tech topics 2025",
                "Roadmap for Full Stack Dev",
                "Roadmap for AI Engineering",
                "Beginner friendly ideas"
            ];
        case 'writeup':
            return [
                "Explain the architecture",
                "How is AI context managed?",
                "What tech stack is used?",
                "Explain the database schema"
            ];
        default:
            return [
                "What can you help me with?",
                "How do I create a roadmap?",
                "Find learning resources"
            ];
    }
};

const AIChatSidebar: React.FC = () => {
    const { isChatOpen, setIsChatOpen, chatContext } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("StudyFlow AI");
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        let initialMessage = "Hi! I'm StudyFlow AI. How can I help you today?";
        if (chatContext?.type === 'roadmap' && chatContext.data) {
            setTitle(`Assistant for: ${chatContext.data.title}`);
            initialMessage = `How can I help you with your "${chatContext.data.title}" roadmap?`;
        } else if (chatContext?.type === 'task' && chatContext.data) {
            setTitle(`Task: ${chatContext.data.task.title}`);
            initialMessage = `I can help you understand "${chatContext.data.task.title}". Need an explanation or more resources?`;
        } else if (chatContext?.type === 'dashboard') {
            setTitle('Dashboard Assistant');
            initialMessage = "I can help with questions about your stats or active roadmaps. What's on your mind?";
        } else if (chatContext?.type === 'create') {
            setTitle('Roadmap Creation Assistant');
            initialMessage = "Need help brainstorming your next learning goal? Just ask!";
        } else if (chatContext?.type === 'writeup') {
            setTitle('Project Assistant');
            initialMessage = "I can explain how this application was built. Ask away!";
        } else {
            setTitle("StudyFlow AI");
        }
        setMessages([{ role: 'model', text: initialMessage }]);
        setSuggestedQuestions(getSuggestedQuestions(chatContext?.type, chatContext?.data));
    }, [chatContext]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, suggestedQuestions]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: textToSend };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(newMessages, textToSend, chatContext);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed top-0 right-0 h-full bg-gray-900/95 backdrop-blur-sm w-full lg:w-[450px] transition-transform duration-300 z-50 flex flex-col border-l border-white/10 shadow-2xl ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <header className="p-5 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary-foreground">psychology</span>
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="font-bold text-white text-lg">StudyFlow AI</h2>
                        <p className="text-xs text-gray-400 truncate max-w-[250px]">{title}</p>
                    </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                    <span className="material-symbols-outlined text-white">close</span>
                </button>
            </header>

            <main className="flex-1 p-5 overflow-y-auto space-y-5">
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="size-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary-foreground">psychology</span>
                        </div>
                        <div className="max-w-md rounded-lg px-4 py-3 bg-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></span>
                        </div>
                    </div>
                )}

                {/* Suggested Questions Area */}
                {!isLoading && suggestedQuestions.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 font-medium mb-3 ml-1 uppercase tracking-wider">Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="text-xs text-left text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-colors duration-200"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            <footer className="p-5 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg border border-white/10 focus-within:border-primary transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a follow-up question..."
                        className="flex-1 bg-transparent p-3 text-white placeholder:text-gray-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="p-3 text-white disabled:text-gray-600 hover:text-primary disabled:hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AIChatSidebar;
