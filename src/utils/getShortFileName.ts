export const getShortFileName = (name: string, maxStart = 6) => {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return name; // нет расширения

  const ext = name.slice(dotIndex);         // ".pdf"
  const base = name.slice(0, maxStart);     // "longfi"

  return `${base}...${ext}`;
};
