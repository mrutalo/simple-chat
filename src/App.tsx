import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, MessageSquare } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = { text: inputText, isUser: true };
      if (currentConversation) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage],
        };
        setCurrentConversation(updatedConversation);
        setConversations(conversations.map(conv =>
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
      } else {
        const newConversation: Conversation = {
          id: Date.now(),
          title: inputText.slice(0, 30) + (inputText.length > 30 ? '...' : ''),
          messages: [newMessage],
        };
        setCurrentConversation(newConversation);
        setConversations([...conversations, newConversation]);
      }
      setInputText('');
      // Here you would typically call an API to get a response
      // For now, we'll just echo the message back
      setTimeout(() => {
        const botResponse: Message = { text: `You said: ${inputText}`, isUser: false };
        if (currentConversation) {
          const updatedConversation = {
            ...currentConversation,
            messages: [...currentConversation.messages, newMessage, botResponse],
          };
          setCurrentConversation(updatedConversation);
          setConversations(conversations.map(conv =>
            conv.id === currentConversation.id ? updatedConversation : conv
          ));
        }
      }, 1000);
    }
  };

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
        setIsListening(true);
      }
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col flex-grow">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">Simple Chat Interface</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {currentConversation?.messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.isUser ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-black'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Send size={24} />
            </button>
            <button
              onClick={toggleListening}
              className={`ml-2 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Mic size={24} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-64 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        <button
          onClick={startNewConversation}
          className="w-full mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Conversation
        </button>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => selectConversation(conv)}
            className={`p-2 mb-2 rounded cursor-pointer flex items-center ${
              currentConversation?.id === conv.id ? 'bg-blue-100' : 'hover:bg-gray-300'
            }`}
          >
            <MessageSquare size={18} className="mr-2" />
            <span className="truncate">{conv.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;