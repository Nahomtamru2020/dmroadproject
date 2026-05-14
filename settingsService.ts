
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC = doc(db, 'system', 'settings');

export const getPassword = async () => {
    const docSnap = await getDoc(SETTINGS_DOC);
    if (!docSnap.exists()) {
        await setDoc(SETTINGS_DOC, { password: 'dmproject2026' });
        return 'dmproject2026';
    }
    return docSnap.data().password?.trim();
};

export const setPassword = async (newPassword: string) => {
    await setDoc(SETTINGS_DOC, { password: newPassword }, { merge: true });
};
