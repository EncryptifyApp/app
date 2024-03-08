import React, { useRef } from 'react';
import { Image, Text, TouchableOpacity, View, Animated } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const Note: React.FC = () => {
  const translateX = useRef(new Animated.Value(0)).current;

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const handleGestureStateChange = (event: { nativeEvent: { state: State } }) => {
    if (event.nativeEvent.state === State.END) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureStateChange}
    >
      <Animated.View
        style={{
          transform: [{ translateX: translateX }],
        }}
      >
        <View className="flex-row justify-between items-center p-2 m-2 bg-steel-gray rounded-lg">
          <View className="flex-1">
            <TouchableOpacity className="flex-row items-center space-x-2">
              <Image className="w-6 h-6 rounded-sn" source={require("../../assets/logo.png")} />
              <Text className="text-white font-primary-semibold text-base">Mike</Text>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-2">
              <Octicons name="note" size={12} color="gray" />
              <Text className="text-white font-primary-regular text-sm">Call me when you can</Text>
            </View>
          </View>

          {/* Buttons for swipe actions */}
          <Animated.View
            style={{
              transform: [{ translateX: translateX }],
              flexDirection: 'row',
              opacity: translateX.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }}
          >
            <TouchableOpacity
              className="bg-green-500 px-2 py-1 rounded"
              onPress={() => console.log('Edit button pressed')}
            >
              <Text className="text-white font-bold text-sm">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 px-2 py-1 rounded"
              onPress={() => console.log('Delete button pressed')}
            >
              <Text className="text-white font-bold text-sm">Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default Note;