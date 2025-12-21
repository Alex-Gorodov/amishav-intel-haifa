export const getShortFileName = (name: string, maxLength = 16) => {
  if (name.length <= maxLength) return name;

  const dotIndex = name.lastIndexOf(".");
  const hasExt = dotIndex > 0 && dotIndex < name.length - 1;

  const ext = hasExt ? name.slice(dotIndex) : "";
  const base = hasExt ? name.slice(0, dotIndex) : name;

  const available = maxLength - ext.length - 3;
  if (available <= 1) {
    return name.slice(0, maxLength - 3) + "...";
  }

  const left = Math.ceil(available / 2);
  const right = Math.floor(available / 2);

  return `${base.slice(0, left)}...${base.slice(base.length - right)}${ext}`;
};
