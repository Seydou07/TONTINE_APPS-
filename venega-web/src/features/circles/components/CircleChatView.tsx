'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { useDemoStore } from '@/lib/demoStore';
import { getCircle, getCircleMembers, getCurrentUser } from '../store';
import { getCircleMessages, sendCircleMessage } from '../chat';

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function formatDateHeader(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Discussion d'un cercle (copie de CircleChatScreen mobile). */
export function CircleChatView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const circle = getCircle(circleId);
  const me = getCurrentUser();
  const messages = getCircleMessages(circleId);
  const headerMembers = getCircleMembers(circleId).slice(0, 3);
  const canSend = !!text.trim();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    sendCircleMessage(circleId, me, text);
    setText('');
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-fill">
      <PageHeader
        title={circle?.name ?? 'Discussion'}
        subtitle={`${circle?.memberCount ?? 0} membres`}
        onBack={() => router.back()}
        right={
          <div className="flex" aria-hidden>
            {headerMembers.map((m, i) => (
              <span key={m.userId} className={`rounded-full ring-2 ring-white ${i > 0 ? '-ml-2' : ''}`}>
                <Avatar name={`${m.user.firstName} ${m.user.lastName}`} uri={m.user.avatarUrl} size={32} />
              </span>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-label="Messages">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
          {messages.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted">Aucun message pour l’instant.</p>
          )}
          {messages.map((msg, index) => {
            const prev = messages[index - 1];
            const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
            const isMe = msg.userId === me.id;
            const grouped = !newDay && prev?.userId === msg.userId;
            return (
              <Fragment key={msg.id}>
                {newDay && (
                  <p className="my-3 text-center">
                    <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-muted">
                      {formatDateHeader(msg.createdAt)}
                    </span>
                  </p>
                )}
                <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-1' : 'mt-3'}`}>
                  {!isMe &&
                    (grouped ? (
                      <span className="w-8 shrink-0" />
                    ) : (
                      <Avatar name={msg.senderName} uri={msg.senderAvatar} size={32} />
                    ))}
                  <div className="max-w-[78%]">
                    {!isMe && !grouped && <p className="mb-1 ml-1 text-[12px] font-semibold text-muted">{msg.senderName}</p>}
                    <div
                      className={`rounded-[18px] px-3.5 py-2 ${
                        isMe ? 'rounded-br-[6px] bg-primary text-white' : 'rounded-bl-[6px] border border-line bg-white text-ink'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                      <p className={`mt-0.5 text-right text-[11px] ${isMe ? 'text-white/75' : 'text-subtle'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-line bg-white px-4 py-2.5"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Écrire un message
          </label>
          <textarea
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
            }}
            placeholder="Écrire un message"
            maxLength={1000}
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[22px] border border-line bg-fill px-4 py-2.5 text-[16px] text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Envoyer"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              canSend ? 'bg-primary text-white hover:bg-[#095E44]' : 'bg-fill text-subtle'
            }`}
          >
            <Send size={18} aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}
