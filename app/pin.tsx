import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function PinScreen() {
    const [pin, setPin] = useState('');

    const handlePinChange = (digit) => {
        if (pin.length < 4) {
            setPin(prevPin => prevPin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(prevPin => prevPin.slice(0, -1));
    };

    const handleSubmit = () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN');
        } else {
            // Handle PIN submission
            // Redirect or perform authentication
        }
    };

    const renderPinCircles = () => {
        return Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className="w-12 h-12 mx-2 items-center justify-center">
                <View className={`w-12 h-12 bg-gray-800 rounded-full items-center justify-center border-2 border-white`}>
                    <Text className={`text-white text-xl ${pin[index] ? '' : 'opacity-0'}`}>{pin[index]}</Text>
                </View>
            </View>
        ));
    };

    return (
        <View className="flex-1 bg-midnight-black p-4">
            
            
            
            {/* Number Buttons */}
            <View className="flex-1 justify-center items-center">
                {/* PIN Circles */}
            <View className="flex-row mb-16">
                {renderPinCircles()}
            </View>
                {[
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                    [0]
                ].map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-center mb-2">
                        {row.map(number => (
                            <TouchableOpacity
                                key={number}
                                className="w-20 h-20 bg-gray-800 rounded-3xl items-center justify-center mx-2 my-1"
                                onPress={() => handlePinChange(number.toString())}
                            >
                                <Text className="text-white text-2xl">{number}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

   

            {/* Hidden TextInput for capturing PIN input */}
            <TextInput
                className="absolute inset-0 opacity-0"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                onChangeText={(text) => setPin(text)}
                value={pin}
                placeholder="Enter PIN"
            />
        </View>
    );
}
