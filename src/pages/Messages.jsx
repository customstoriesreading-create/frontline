import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ConversationList from '@/components/messages/ConversationList';
import MessageThread from '@/components/messages/MessageThread';
import useCurrentUser from '@/hooks/useCurrentUser';
import { conversationSummaries, threadWith } from '@/lib/messages';

const loadMyMessages = (email) =>
  base44.entities.Message
    .filter(
      { $or: [{ sender_email: email }, { recipient_email: email }] },
      { sort: '-created_date', limit: 200 }
    )
    .then((page) => page.items || []);

export default function Messages() {
  const { user, loading: userLoading } = useCurrentUser();
  const [messages, setMessages] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEmail, setActiveEmail] = useState(null);
  const [sending, setSending] = useState(false);
  const myEmail = user?.email;

  useEffect(() => {
    if (!myEmail) return undefined;
    let active = true;
    const refresh = () =>
      loadMyMessages(myEmail).then((items) => {
        if (active) setMessages(items);
      });

    Promise.all([base44.functions.invoke('listTeamMembers', {}), refresh()]).then(([response]) => {
      if (!active) return;
      setDirectory(response.data?.directory || []);
      setLoading(false);
    });

    const unsubscribe = base44.entities.Message.subscribe(() => {
      refresh();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [myEmail]);

  const openThread = async (email) => {
    setActiveEmail(email);
    const unread = messages.filter(
      (message) => message.sender_email === email && message.recipient_email === myEmail && !message.read
    );
    if (unread.length === 0) return;
    setMessages((current) =>
      current.map((message) =>
        message.sender_email === email && message.recipient_email === myEmail
          ? { ...message, read: true }
          : message
      )
    );
    await base44.entities.Message.updateMany(
      { sender_email: email, recipient_email: myEmail, read: false },
      { $set: { read: true } }
    );
  };

  const send = async (body) => {
    const recipient = directory.find((person) => person.email === activeEmail);
    setSending(true);
    try {
      await base44.entities.Message.create({
        sender_email: myEmail,
        sender_name: user?.full_name || myEmail,
        recipient_email: activeEmail,
        recipient_name: recipient?.full_name || activeEmail,
        body,
        read: false,
      });
      setMessages(await loadMyMessages(myEmail));
    } finally {
      setSending(false);
    }
  };

  if (activeEmail) {
    const person = directory.find((entry) => entry.email === activeEmail);
    return (
      <MessageThread
        person={{ name: person?.full_name || activeEmail, email: activeEmail }}
        messages={threadWith(messages, activeEmail)}
        myEmail={myEmail}
        sending={sending}
        onBack={() => setActiveEmail(null)}
        onSend={send}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Talk to anyone at the dealership — private to the two of you.
        </p>
      </div>
      <ConversationList
        conversations={conversationSummaries(messages, myEmail, directory)}
        loading={userLoading || loading}
        onOpen={openThread}
      />
    </div>
  );
}