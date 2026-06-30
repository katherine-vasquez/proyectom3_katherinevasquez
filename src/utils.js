export function formatMessage(role, text) {
  return `${role}: ${text}`;
}

export function isEmpty(text) {
  return !text || text.trim().length === 0;
}