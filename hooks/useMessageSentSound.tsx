import { useEffect, useState } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS} from 'expo-av';

const useMessageSentSound = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    try {
      // Configure audio settings to respect silent mode on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        playsInSilentModeIOS: false, // Do not play if the device is on mute
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      });

      // Create the sound instance
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/messageSent.mp3')
      );
      setSound(sound);

      // Play the sound
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return playSound;
};

export default useMessageSentSound;

