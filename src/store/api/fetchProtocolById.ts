import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Protocol } from '../../types/Protocol';

export const fetchProtocolById = async (id: string): Promise<Protocol | null> => {
  try {
    const ref = doc(db, 'protocols', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn('❌ Protocol not found:', id);
      return null;
    }

    const data = snap.data();

    return {
      id: snap.id,
      title: data.title,
      content: data.content,
      headerImage: data.headerImage || null,
      images: data.images?.map((url: string) => ({ uri: url })) ?? [],
    };

  } catch (e) {
    console.error('❌ Error fetching protocol:', e);
    return null;
  }
};
