import { database } from './sign';
import { ref, set } from 'firebase/database';

export const saveSettingsToFirebase = (settingsData) => {

    const settingsRef = ref(database, settingsData.uid); // Use the UID in the path
    return set(settingsRef, settingsData);
  };