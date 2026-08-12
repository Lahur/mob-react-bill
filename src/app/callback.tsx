import { useEffect } from 'react';
import { router } from 'expo-router';

export default function CallbackScreen() {
  useEffect(() => {
    router.replace('/');
  }, []);

  return null;
}
