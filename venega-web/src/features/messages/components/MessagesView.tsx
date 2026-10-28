'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { mockChatMessages, mockCircles, type Circle } from '@venega/types';
import { input } from '@/components/ui/classes';
import { Avatar } from '@/components/ui/misc';

const time = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

/**
 * Discussions de cercle. Téléphone : liste puis conversation (un écran à la fois).
 * Ordinateur : liste et conversation côte à côte.
 */
export function MessagesView() {
  const [active, setActive] = useState<Circle | null>(null);
  const current = active ?? mockCircles[0]!;
  const messages = mockChatMessages.filter((m) => m.circleId === current.id);
  const lastMessage = (circleId: string) => {
    const list = mockChatMessages.filter((m) => m.circleId === circleId);
    return list[list.length - 1]?.content;
  };

  return (
    <div className="flex h-[calc(100dvh-76px)] md:h-screen">
      {/* Liste des conversations */}
      <section
        aria-label="Conversations"
        className={`w-full flex-col border-r border-line bg-white md:flex md:w-80 ${active ? 'hidden' : 'flex'}`}
      >
        <div className="bg-primary-dark px-4 pb-5 pt-5 text-white">
          <h1 className="text-[22px] font-bold">Messages</h1>
          <p className="text-[14px] text-white/75">Discussions de vos cercles</p>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {mockCircles.map((circle) => {
            const selected = current.id === circle.id;
            return (
              <li key={circle.id}>
                <button
                  type="button"
                  onClick={() => setActive(circle)}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selected ? 'md:bg-primary-tint' : 'hover:bg-fill'
                  }`}
                >
                  <Avatar name={circle.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{circle.name}</p>
                    <p className="truncate text-[13px] text-muted">
                      {lastMessage(circle.id) ?? `${circle.memberCount} membres`}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-subtle md:hidden" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Conversation */}
      <section
        aria-label={`Discussion ${current.name}`}
        className={`min-w-0 flex-1 flex-col bg-bg md:flex ${active ? 'flex' : 'hidden'}`}
      >
        <header className="flex min-h-[64px] items-center gap-2 border-b border-line bg-white px-2 md:px-4">
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Retour aux conversations"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill md:hidden"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <Avatar name={current.name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{current.name}</p>
            <p className="text-[12px] text-muted">{current.memberCount} membres</p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted">Aucun message pour le moment.</p>
          )}
          {messages.map((msg) => {
            const mine = msg.userId === 'u1';
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!mine && <Avatar name={msg.senderName} size={30} tone="neutral" />}
                <div
                  className={`max-w-[78%] rounded-[16px] px-3.5 py-2 ${
                    mine ? 'rounded-br-[4px] bg-primary text-white' : 'rounded-bl-[4px] border border-line bg-white text-ink'
                  }`}
                >
                  {!mine && <p className="mb-0.5 text-[12px] font-semibold text-primary-dark">{msg.senderName}</p>}
                  <p className="text-[15px]">{msg.content}</p>
                  <p className={`mt-0.5 text-right text-[11px] ${mine ? 'text-white/70' : 'text-subtle'}`}>
                    {time(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 border-t border-line bg-white p-3">
          <label htmlFor="chat-input" className="sr-only">
            Votre message
          </label>
          <input id="chat-input" placeholder="Écrire un message…" className={input} autoComplete="off" />
          <button
            type="submit"
            aria-label="Envoyer"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-primary text-white hover:bg-[#095E44]"
          >
            <Send size={19} aria-hidden />
          </button>
        </form>
      </section>
    </div>
  );
}
