
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="size-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#111f22]">psychology</span>
                </div>
            )}
            <div className={`max-w-md rounded-lg px-4 py-3 ${isUser ? 'bg-primary text-[#111f22]' : 'bg-[#111f22]'}`}>
                {/* A simple markdown parser for bold text */}
                <p className="text-sm" dangerouslySetInnerHTML={{
                    __html: (message.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary underline">$1</a>')
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
        <div className={`fixed top-0 right-0 h-full bg-[#192f33] w-full lg:w-[400px] transition-transform duration-300 z-50 flex flex-col border-l border-[#325e67] shadow-2xl ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <header className="p-4 border-b border-[#325e67] flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#111f22]">psychology</span>
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="font-bold text-white">StudyFlow AI</h2>
                        <p className="text-xs text-[#92c0c9] truncate max-w-[200px]">{title}</p>
                    </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-[#234248]">
                    <span className="material-symbols-outlined text-white">close</span>
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#111f22]">psychology</span>
                        </div>
                        <div className="max-w-md rounded-lg px-4 py-3 bg-[#111f22] flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></span>
                        </div>
                    </div>
                )}

                {/* Suggested Questions Area */}
                {!isLoading && suggestedQuestions.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <p className="text-xs text-[#92c0c9] font-medium mb-3 ml-1 uppercase tracking-wider">Suggested Questions</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="text-xs text-left text-white bg-[#234248] hover:bg-[#325e67] border border-[#325e67] px-3 py-2 rounded-lg transition-colors duration-200"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-[#325e67] flex-shrink-0">
                <div className="flex items-center gap-2 bg-[#111f22] rounded-lg border border-[#325e67] focus-within:border-primary">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for links, tips..."
                        className="flex-1 bg-transparent p-3 text-white placeholder:text-[#92c0c9] focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="p-3 text-white disabled:text-gray-500 hover:text-primary disabled:hover:text-gray-500">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AIChatSidebar;
