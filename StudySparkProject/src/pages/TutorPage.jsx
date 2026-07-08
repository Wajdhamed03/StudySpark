import React, { useState } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TutorPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI Study Tutor 🎓 I can help you understand your study materials, explain concepts simply, give examples, or even make educational rhymes! What would you like to learn?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    
    // إضافة رسالة المستخدم للشات
    setMessages((prev) => [...prev, { id: Date.now(), text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      // إرسال السؤال للباكيند الحقيقي
     const response = await fetch("https://studyspark-yh07.onrender.com/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { id: Date.now(), text: data.reply, isBot: true }]);
      } else {
        throw new Error("No reply received");
      }
    } catch (error) {
      console.error("Tutor Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: "Sorry, I'm having trouble connecting to the server. Please make sure the backend is running!", isBot: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[85vh] flex flex-col py-4 px-2">
      {/* Header */}
      <div className="flex items-center gap-2 border-b pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI Tutor</h2>
          <p className="text-xs text-muted-foreground">Ask questions about your study materials</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isBot ? "justify-start" : "justify-end"}`}>
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                msg.isBot
                  ? "bg-card border text-foreground rounded-tl-none"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none"
              }`}
            >
              {msg.text}
            </div>
            {!msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your tutor anything..."
          disabled={isLoading}
          className="flex-1 h-12 px-4 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-12 w-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center p-0 shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
