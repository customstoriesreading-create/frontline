import React from 'react';
import { MessageSquare } from 'lucide-react';
import { formatDayStamp, initialsFor } from '@/lib/format';

export default function ConversationList({ conversations, loading, onOpen }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-16 w-full animate-pulse rounded-[var(--radius)] bg-muted" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="surface px-6 py-12 text-center">
        <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground" />
        <p className="mt-3 font-heading text-base font-semibold">No teammates yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once someone joins the dealership, they show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.email}
          type="button"
          onClick={() => onOpen(conversation.email)}
          className="surface flex w-full items-center gap-3 p-3 text-left transition-transform duration-200 active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
            {initialsFor(conversation.name, conversation.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate font-heading text-sm font-semibold tracking-tight">
                {conversation.name}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {conversation.last ? formatDayStamp(conversation.last.created_date) : 'New'}
              </span>
            </span>
            <span className="mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate text-xs text-muted-foreground">
                {conversation.last ? conversation.last.body : 'Start a conversation'}
              </span>
              {conversation.unread > 0 ? (
                <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                  {conversation.unread}
                </span>
              ) : null}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}