export function counterpartOf(message, myEmail) {
  return message.sender_email === myEmail
    ? { email: message.recipient_email, name: message.recipient_name }
    : { email: message.sender_email, name: message.sender_name };
}

export function threadWith(messages, otherEmail) {
  return messages
    .filter((message) => message.sender_email === otherEmail || message.recipient_email === otherEmail)
    .sort((a, b) => String(a.created_date || '').localeCompare(String(b.created_date || '')));
}

/**
 * One row per teammate: everyone in the directory is reachable, and anyone you
 * already exchanged messages with stays in the list even if they leave.
 */
export function conversationSummaries(messages, myEmail, directory) {
  const map = new Map();

  directory.forEach((person) => {
    if (!person?.email || person.email === myEmail) return;
    map.set(person.email, {
      email: person.email,
      name: person.full_name || person.email,
      last: null,
      unread: 0,
    });
  });

  messages.forEach((message) => {
    const other = counterpartOf(message, myEmail);
    if (!other?.email || other.email === myEmail) return;
    const entry = map.get(other.email) || {
      email: other.email,
      name: other.name || other.email,
      last: null,
      unread: 0,
    };
    if (other.name && entry.name === entry.email) entry.name = other.name;
    if (!entry.last || String(message.created_date || '') > String(entry.last.created_date || '')) {
      entry.last = message;
    }
    if (message.recipient_email === myEmail && !message.read) entry.unread += 1;
    map.set(other.email, entry);
  });

  return Array.from(map.values()).sort((a, b) => {
    const aKey = a.last ? String(a.last.created_date || '') : '';
    const bKey = b.last ? String(b.last.created_date || '') : '';
    if (aKey && bKey) return bKey.localeCompare(aKey);
    if (aKey) return -1;
    if (bKey) return 1;
    return a.name.localeCompare(b.name);
  });
}