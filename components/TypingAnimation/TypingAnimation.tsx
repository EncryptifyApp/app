import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

const TypingAnimation = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateDot = (dot:any, delay:any) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        delay: delay,
                        easing: Easing.linear,
                        useNativeDriver: true
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.linear,
                        useNativeDriver: true
                    })
                ])
            ).start();
        };

        animateDot(dot1, 0);
        animateDot(dot2, 150);
        animateDot(dot3, 300);
    }, [dot1, dot2, dot3]);

    const animatedStyle = (dot:any) => ({
        opacity: dot
    });

    return (
        <View className="flex flex-row items-center space-x-1">
            <Animated.View className={"h-1.5 w-1.5 bg-primary rounded-full"} style={[animatedStyle(dot1)]} />
            <Animated.View className={"h-1.5 w-1.5 bg-primary rounded-full"} style={[animatedStyle(dot2)]} />
            <Animated.View className={"h-1.5 w-1.5 bg-primary rounded-full"} style={[animatedStyle(dot3)]} />
        </View>
    );
};

export default TypingAnimation;
