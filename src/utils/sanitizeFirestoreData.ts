export const sanitizeFirestoreData = (data: any): any => {
  if (data === null || data === undefined) return data;

  // Handle Firestore Timestamps directly
  if (data && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  // Handle raw seconds/nanoseconds objects that lost their prototype
  if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000).toISOString();
  }

  // Recurse into Arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  }

  // Recurse into Objects
  if (typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObj[key] = sanitizeFirestoreData(data[key]);
      }
    }
    return sanitizedObj;
  }

  return data;
};
