import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const DecryptingAnimation = ({ finalText, duration }: { finalText: string, duration: number }) => {
    const [displayedText, setDisplayedText] = useState('');
    const animationProgress = useSharedValue(0);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedText(prev => {
                const randomText = Array(finalText.length)
                    .fill(0)
                    .map((_, i) =>
                        prev[i] === finalText[i] ? finalText[i] : characters[Math.floor(Math.random() * characters.length)]
                    )
                    .join('');
                return randomText;
            });
        }, 50);

        animationProgress.value = withTiming(1, { duration }, () => {
            clearInterval(interval);
            setDisplayedText(finalText);
        });

        return () => clearInterval(interval);
    }, [finalText, duration, animationProgress]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: animationProgress.value,
        };
    });

    return (
        <Animated.Text style={[styles.hackerText, animatedStyle]}>
            {displayedText}
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    hackerText: {
        fontSize: 24,
        color: '#00FF00',
        fontFamily: 'monospace',
    },
});


export default DecryptingAnimation;