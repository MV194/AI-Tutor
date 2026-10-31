import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, MessageSquare, Sparkles, User, HelpCircle, Swords } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { renderRichAcademicText } from "../utils/markdownParser";

interface FollowUpChatProps {
  textInput: string;
  subject: string;
  gradeLevel: string;
  onSendMessage: (msg: string, context: { textInput: string; subject: string; gradeLevel: string }, history: ChatMessage[]) => Promise<string>;
}

export default function FollowUpChat({ textInput, subject, gradeLevel, onSendMessage }: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userMsgText = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const tutorReply = await onSendMessage(
        userMsgText,
        { textInput, subject, gradeLevel },
        messages
      );

      const newTutorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "tutor",
        text: tutorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newTutorMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "tutor",
        text: `Error: ${err.message || 'I had a high-orbit drop in connecting. Let\'s try re-submitting this query.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="follow-up-chat" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px] transition-colors">
      
      {/* Header Container */}
      <div className="bg-zinc-900 dark:bg-zinc-950 px-4 py-3.5 flex items-center justify-between border-b dark:border-zinc-850 transition-colors">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
          <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5 font-mono">
            <Swords className="h-3.5 w-3.5 text-amber-400" /> LIVE CLASSROOM CONVERSATION
          </h4>
        </div>
        <span className="text-[9px] text-zinc-400 font-bold tracking-widest font-mono">OmniTutor v1.9</span>
      </div>

      {/* Message Screen Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center border border-amber-200 dark:border-amber-900/45">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Test Your Theories & Answer Drafts</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed font-semibold">
              Ask follow-up questions, e.g., &ldquo;Can you explain why that exponent was divided?&rdquo; or &ldquo;Evaluate my trial code run&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className={`flex gap-2.5 max-w-[85%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 text-xs font-extrabold shadow-sm ${
                        isUser
                          ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                          : "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400"
                      }`}
                    >
                      {isUser ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? "bg-zinc-900 dark:bg-zinc-950 text-white dark:text-zinc-200 rounded-tr-none border dark:border-zinc-800/40"
                            : "bg-white dark:bg-zinc-855 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                        }`}
                      >
                        {renderRichAcademicText(m.text)}
                      </div>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block px-1 text-right">
                        {m.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        )}

        {isSending && (
          <div className="flex gap-2 max-w-[85%] mr-auto">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-400 flex items-center gap-1 shadow-sm">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-150">●</span>
              <span className="animate-bounce delay-300">●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input container footer */}
      <form onSubmit={handleSend} className="p-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 transition-colors">
        <input
          type="text"
          className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-750 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-550 transition-all"
          placeholder="Type your study response or clarify code steps..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-lg transition shrink-0 cursor-pointer flex items-center justify-center disabled:opacity-40"
          disabled={!inputValue.trim() || isSending}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
