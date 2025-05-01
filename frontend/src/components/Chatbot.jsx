import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GEMINI_API_KEY = 'AIzaSyDJEWKgm0hQvWB71wHqjiGQsmTub-wjSGY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your health and navigation assistant. How can I help you today?",
            sender: 'bot',
            quickActions: [
                { text: "Find Hospitals", action: "/hospitals" },
                { text: "Blood Donations", action: "/blood-requests" },
                { text: "Medical Card", action: "/medical-card" }
            ]
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleMessage = async (query) => {
        try {
            console.log('Processing message with Gemini...');

            const requestBody = {
                contents: [{
                    role: "user",
                    parts: [{
                        text: `You are a medical and navigation assistant for a healthcare website. 
                        The website has these main sections with their corresponding routes:
                        
                        Main Navigation:
                        - Dashboard: /dashboard
                        - Medical Card: /medical-card
                        - Blood Donations: /blood-requests
                        - Find Hospitals: /hospitals
                        - Reviews: /reviews
                        
                        Blood Donation Related:
                        - My Blood Donations: /my-blood-requests
                        - Create Donation Request: /add-blood-request
                        - Blood Donation History: /donation-history
                        
                        Hospital Related:
                        - Hospital Search: /hospitals
                        - Hospital Reviews: /hospital-reviews
                        - Hospital Details: /hospitals/:id
                        
                        User Profile:
                        - My Profile: /profile
                        - My Reviews: /my-reviews
                        - Settings: /settings
                        
                        Support:
                        - FAQ: /faq
                        - Contact Us: /contact
                        - About Us: /about
                        
                        Authentication:
                        - Login: /login
                        - Register: /register
                        - Forgot Password: /forgot-password
                        
                        If the user asks a health-related question, provide a brief and helpful medical response.
                        If the user wants to navigate somewhere, respond with the exact route in this format: [NAVIGATE:/route]
                        For example: [NAVIGATE:/hospitals] for hospital search.
                        
                        User's message: ${query}
                        
                        Keep your response concise and informative.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Gemini Response:', data);

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            }

            return "I'm sorry, I couldn't process your request. Please try again.";
        } catch (error) {
            console.error('Error:', error);
            return "I'm having trouble processing your request. Please try again.";
        }
    };

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const response = await handleMessage(input);

        // Check if the response contains a navigation command
        const navigationMatch = response.match(/\[NAVIGATE:(.*?)\]/);
        if (navigationMatch) {
            const route = navigationMatch[1];
            navigate(route);
            setMessages(prev => [...prev, {
                text: `Taking you to ${route.replace('/', '')}...`,
                sender: 'bot'
            }]);
        } else {
            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        }

        setIsLoading(false);
    };

    const handleQuickAction = (action) => {
        navigate(action);
        setMessages(prev => [...prev, {
            text: `Taking you to ${action.replace('/', '')}...`,
            sender: 'bot'
        }]);
        setShowQuickActions(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center relative"
            >
                {/* Subtle shine effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                        x: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20.5 12.5c0 4.142-3.358 7.5-7.5 7.5-1.5 0-2.9-.44-4.1-1.2l-4.3 1.2 1.2-4.3c-.76-1.2-1.2-2.6-1.2-4.1 0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12.5h6M9 9.5h6"
                    />
                </svg>

                {/* Notification dot */}
                {messages.length > 1 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                    />
                )}
            </motion.button>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M20.5 12.5c0 4.142-3.358 7.5-7.5 7.5-1.5 0-2.9-.44-4.1-1.2l-4.3 1.2 1.2-4.3c-.76-1.2-1.2-2.6-1.2-4.1 0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 12.5h6M9 9.5h6"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Health Assistant</h3>
                                        <p className="text-xs text-teal-100">Online</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    <div
                                        className={`inline-block p-3 rounded-2xl max-w-[80%] ${message.sender === 'user'
                                                ? 'bg-teal-500 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        {message.text}
                                    </div>
                                    {message.quickActions && showQuickActions && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 flex flex-wrap gap-2"
                                        >
                                            {message.quickActions.map((action, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleQuickAction(action.action)}
                                                    className="px-3 py-1.5 bg-teal-100 text-teal-700 text-sm rounded-full hover:bg-teal-200 transition-colors"
                                                >
                                                    {action.text}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 bg-white p-2 rounded-full shadow-sm">
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-teal-500 border-t-transparent"></div>
                                        <span className="text-sm text-gray-500">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-1 bg-white p-2 rounded-full shadow-sm w-fit"
                                >
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-sm text-gray-500">Typing...</span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setIsTyping(true);
                                        setTimeout(() => setIsTyping(false), 1000);
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 p-3 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading}
                                    className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot; 