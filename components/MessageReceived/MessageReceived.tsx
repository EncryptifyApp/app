import React from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';
import { Message} from '../../generated/graphql';

interface Props {
    message: Message;
}

const MessageReceived: React.FC<Props> = ({ message }) => {
    return (
        <View className="justify-start items-start mb-2">
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
        </View>
    );
};

export default MessageReceived;
