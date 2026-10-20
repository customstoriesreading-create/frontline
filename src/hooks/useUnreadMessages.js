import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/** Unread messages addressed to the signed-in teammate, kept live. */
export default function useUnreadMessages(user) {
  const [unread, setUnread] = useState(0);
  const email = user?.email;

  useEffect(() => {
    if (!email) {
      setUnread(0);
      return undefined;
    }
    let active = true;
    const refresh = () =>
      base44.entities.Message.count({ recipient_email: email, read: false })
        .then((count) => {
          if (active) setUnread(count);
        })
        .catch(() => {});
    refresh();
    const unsubscribe = base44.entities.Message.subscribe(() => refresh());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [email]);

  return unread;
}