/**
 * Messagerie d'un cercle (démo). Comme sur le mobile, les messages envoyés restent
 * locaux ; ils sont gardés ici pour la durée de la session.
 *
 * TODO API: aucun endpoint de messagerie dans docs/api-mobile.md — à ajouter
 * (ex. `GET /circles/:id/messages`, `POST /circles/:id/messages` avec le DTO SendMessageDto).
 */
import { mockChatMessages, type ChatMessage, type User } from '@venega/types';
import { emitChange } from '@/lib/demoStore';

let sent: ChatMessage[] = [];

export function getCircleMessages(circleId: string): ChatMessage[] {
  return [...mockChatMessages, ...sent]
    .filter((m) => m.circleId === circleId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sendCircleMessage(circleId: string, author: User, content: string): void {
  const text = content.trim();
  if (!text) return;
  sent = [
    ...sent,
    {
      id: `m_${Date.now()}`,
      circleId,
      userId: author.id,
      senderName: `${author.firstName} ${author.lastName}`,
      senderAvatar: author.avatarUrl,
      content: text,
      createdAt: new Date().toISOString(),
    },
  ];
  emitChange();
}
