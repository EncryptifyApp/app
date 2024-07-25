import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

const useMessageSentSound = () => {
  const [sound, setSound] = useState<any>();

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/messageSent.mp3')
      );
      setSound(sound);

      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return playSound;
};

export default useMessageSentSound;