"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { mockCircles, mockChatMessages } from "@venega/types/mocks";

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MessagesPage() {
  const [activeCircle, setActiveCircle] = React.useState(mockCircles[0]);
  const messages = mockChatMessages.filter(
    (m) => m.circleId === activeCircle.id
  );

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)]">
      {/* Sidebar: Circles list */}
      <div className="w-80 border-r border-border bg-surface flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold font-sora text-text">
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockCircles.map((circle, index) => (
            <button
              key={circle.id}
              onClick={() => setActiveCircle(circle)}
              className={`w-full text-left p-4 border-b border-border hover:bg-bg transition-colors ${
                activeCircle.id === circle.id ? "bg-primary-tint" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold font-sora">
                  {circle.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-worksans text-text truncate">
                    {circle.name}
                  </p>
                  <p className="text-sm text-text-muted font-worksans truncate">
                    Dernier message...
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-bg">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold font-sora">
              {activeCircle.name[0]}
            </div>
            <div>
              <p className="font-semibold font-worksans text-text">
                {activeCircle.name}
              </p>
              <p className="text-xs text-text-muted font-worksans">
                {activeCircle.memberCount} membres
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex gap-3 ${
                msg.userId === "u1" ? "flex-row-reverse" : ""
              }`}
            >
              {msg.userId !== "u1" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {msg.senderName[0]}
                </div>
              )}
              <div
                className={`max-w-[70%] ${
                  msg.userId === "u1"
                    ? "bg-primary text-white rounded-t-2xl rounded-bl-2xl px-4 py-2"
                    : "bg-surface border border-border rounded-t-2xl rounded-br-2xl px-4 py-2"
                }`}
              >
                {msg.userId !== "u1" && (
                  <p className="text-xs font-semibold mb-1">
                    {msg.senderName}
                  </p>
                )}
                <p className="text-sm font-worksans">{msg.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-surface">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 px-4 py-2 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary transition-all"
            />
            <button className="px-5 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all">
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
