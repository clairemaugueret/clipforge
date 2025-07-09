export function formatHumanDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay) return `Aujourd’hui à ${time}`;
  if (isYesterday) return `Hier à ${time}`;
  return `Le ${date.toLocaleDateString("fr-FR")} à ${time}`;
}
