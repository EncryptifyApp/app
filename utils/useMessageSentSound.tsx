import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

const useMessageSentSound = () => {
  const [sound, setSound] = useState<any>();

  async function playSound() {
    try {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/messageSent.mp3')
      );
      setSound(sound);

      console.log('Playing Sound');
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return playSound;
};

export default useMessageSentSound;
