import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface Props {
  text: string;
  duration: number; // in milliseconds
}

const DecryptingAnimation = ({ text, duration }: Props) => {
  const displayedText = useSharedValue('');
  const currentIndex = useSharedValue(0);

  useEffect(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const textArray = text.split('');

    const interval = setInterval(() => {
      if (currentIndex.value < textArray.length) {
        textArray[currentIndex.value] = characters.charAt(Math.floor(Math.random() * characters.length));
        displayedText.value = textArray.join('');
        currentIndex.value++;
      } else {
        clearInterval(interval);
        displayedText.value = text;
      }
    }, duration / text.length);

    return () => clearInterval(interval);
  }, [text, duration, currentIndex, displayedText]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedStyle]}>
        {displayedText.value}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#00e701',
    fontFamily: 'monospace',
  },
});

export default DecryptingAnimation;
