"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Globe, 
  BookOpen, 
  Languages 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  {
    label: "🇯🇵 Learn Japanese Counter Words",
    text: "How do I count objects in Japanese? Explain the basic counters with examples.",
  },
  {
    label: "🇰🇷 Learn Korean Particles",
    text: "What is the difference between 은/는 (eun/neun) and 이/가 (i/ga) in Korean?",
  },
  {
    label: "🇬🇧 English Grammar Correction",
    text: "Can you correct this sentence: 'He don't know where is the school.'? Explain my mistakes.",
  },
  {
    label: "🔄 Translation & Nuance Help",
    text: "How do you say 'Thank you for your hard work' in Japanese and Korean, and when do I use them?",
  },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your BhasaGuru AI Language Tutor. I can help you practice and learn English (🇬🇧), Japanese (🇯🇵), and Korean (🇰🇷). Ask me any questions about grammar, translations, vocabulary, or ask me to correct your writing! What language would you like to practice today? ✨",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the message container whenever new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setError(null);
    const userMessage: Message = { role: "user", content: textToSend };
    
    // Add user message immediately to the UI
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Send only the necessary fields for standard OpenAI chat message format
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong while connecting to the AI.");
      }

      if (data.success && data.data?.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.data.message },
        ]);
      } else {
        throw new Error("Invalid response structure received from server.");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Failed to reach the AI language tutor. Please make sure the Groq API Key is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      setMessages([
        {
          role: "assistant",
          content: "Chat cleared! I am ready for your next language learning question. What would you like to study? 🇬🇧 🇯🇵 🇰🇷",
        },
      ]);
      setError(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Powered by Groq AI
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          BhasaGuru AI Language Tutor
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Get instant feedback on grammar, translate sentences, or practice conversations in English, Japanese, and Korean.
        </p>
      </div>

      {/* Chat Container */}
      <Card className="border border-border bg-card shadow-lg flex flex-col h-[600px] rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-muted/40 border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                AI Language Tutor
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Languages className="w-3 h-3 text-primary" />
                English • Japanese • Korean
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            disabled={messages.length <= 1}
            title="Clear Chat History"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {isUser ? "U" : "AI"}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                AI
              </div>
              <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-border shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Thinking and translating...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2 items-start max-w-2xl mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Error:</span> {error}
                <div className="mt-1 text-xs opacity-95">
                  Please verify that you have added your <code className="bg-destructive/10 px-1 py-0.5 rounded font-mono">GROQ_API_KEY</code> to your <code className="bg-destructive/10 px-1 py-0.5 rounded font-mono">.env.local</code> file and restarted your development server.
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="p-4 md:p-6 border-t border-border bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" /> Try asking:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt.text)}
                  className="text-left text-xs p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer shadow-xs font-medium"
                >
                  <div className="font-bold text-foreground mb-1">{prompt.label}</div>
                  <div className="text-muted-foreground line-clamp-1">{prompt.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="border-t border-border p-4 bg-muted/40">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me a language-learning question..."
              className="flex-1 bg-card border-border focus-visible:ring-primary h-11 px-4 text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="default"
              disabled={isLoading || !inputValue.trim()}
              className="h-11 px-5 font-medium flex items-center gap-1.5 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
