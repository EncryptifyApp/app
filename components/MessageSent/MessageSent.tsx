import { Ionicons } from '@expo/vector-icons'
import moment from 'moment'
import React from 'react'
import { View, Text } from 'react-native'
import { Message, MessageStatus} from '../../generated/graphql'

interface Props {
    message: Message,
}

export default function MessageSent({ message }: Props) {
    return (
        <View className="justify-end items-end mb-2">
            <View className="bg-primary rounded-md p-2 max-w-xs">
                <Text className="text-black font-primary-semibold text-base">
                    {message.content}
                </Text>
                <View className="flex flex-row justify-end items-center space-x-1">
                    <Text className="text-black font-primary-regular text-xs">
                        {moment(message.createdAt).format('HH:mm')}
                    </Text>
                    {
                        message.status === MessageStatus.Pending && <Ionicons name="time-outline" size={14} color={'black'} />
                    }
                    {
                        message.status === MessageStatus.Sent && <Ionicons name="checkmark" size={14} color={'black'} />
                    }
                    {
                        message.status === MessageStatus.Delivered && <Ionicons name="checkmark-done" size={14} color={'black'} />
                    }
                    {
                        message.status === MessageStatus.Read && <Ionicons name="checkmark-done" size={14} color={'black'} />
                    }
                </View>
            </View>
        </View>
    )
}
