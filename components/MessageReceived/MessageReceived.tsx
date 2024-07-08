import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import moment from 'moment';
import { Message } from '../../generated/graphql';
import * as Clipboard from 'expo-clipboard';

interface Props {
    message: Message;
}

const MessageReceived: React.FC<Props> = ({ message }) => {
    const handleLongPress = async (content: string) => {
        await Clipboard.setStringAsync(content);
    };

    return (
        <TouchableOpacity
            onLongPress={() => handleLongPress(message.content)}
            className="justify-start items-start mb-2"
        >
            <View className="bg-steel-gray rounded-md p-2 max-w-xs">
                <Text className="text-white font-primary-semibold text-base">
                    {message.content}
                </Text>
                <View className="flex flex-row justify-end items-center space-x-1">
                    <Text className="text-white font-primary-regular text-xs">
                        {moment(message.createdAt).format('HH:mm')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default MessageReceived;
