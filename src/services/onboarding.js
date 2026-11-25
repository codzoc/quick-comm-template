import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'settings';
const ONBOARDING_DOC_ID = 'onboarding';

export async function getOnboardingStatus() {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, ONBOARDING_DOC_ID));
    if (!snap.exists()) {
      return { completed: false, dismissed: false };
    }
    const data = snap.data() || {};
    return {
      completed: Boolean(data.completed),
      dismissed: Boolean(data.dismissed)
    };
  } catch (error) {
    console.error('Error loading onboarding status:', error);
    return { completed: false, dismissed: false };
  }
}

export async function saveOnboardingStatus({ completed, dismissed }) {
  await setDoc(
    doc(db, COLLECTION_NAME, ONBOARDING_DOC_ID),
    {
      completed: Boolean(completed),
      dismissed: Boolean(dismissed),
      updatedAt: new Date()
    },
    { merge: true }
  );
}
