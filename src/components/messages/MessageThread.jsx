import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, initialsFor } from '@/lib/format';

export default function MessageThread({ person, messages, myEmail, sending, onBack, onSend }) {
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    await onSend(body);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to messages"
          className="chip grid h-9 w-9 place-items-center text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
          {initialsFor(person.name, person.email)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading text-sm font-semibold tracking-tight">{person.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
        </span>
      </div>

      <div className="space-y-2">
        {messages.length === 0 ? (
          <div className="surface px-6 py-10 text-center">
            <p className="font-heading text-sm font-semibold">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Say hello — only the two of you can read this.</p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.sender_email === myEmail;
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`surface max-w-[80%] px-3.5 py-2.5 ${
                    mine ? 'bg-primary/14 text-foreground' : 'text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{formatTime(message.created_date)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          className="field h-11 flex-1 px-3.5 text-sm"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Message ${person.name.split(' ')[0] || person.name}`}
          aria-label="Message"
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()} className="h-11 w-11 rounded-full">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}