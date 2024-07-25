import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Message, MessageStatus } from '../../__generated__/graphql';
import * as Clipboard from 'expo-clipboard';
import { Menu } from 'react-native-paper';
import { styles } from '../../styles/MessageMenuStyles';

interface Props {
    message: Message;
}

export default function MessageSent({ message }: Props) {
    const [visible, setVisible] = useState(false);
    const [anchor, setAnchor] = useState<{ x: number, y: number } | undefined>(undefined);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleLongPress = (event: any) => {
        setAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
        openMenu();
    };

    const handleCopy = async (content: string) => {
        await Clipboard.setStringAsync(content);
        closeMenu();
    };

    return (
        <View>
            <TouchableOpacity
                onLongPress={handleLongPress}
                className="justify-end items-end mb-2"
            >
                <View className="bg-primary rounded-md p-2 max-w-xs">
                    <Text className="text-black font-primary-semibold text-base">
                        {message.content}
                    </Text>
                    <View className="flex flex-row justify-end items-center space-x-1">
                        <Text className="text-black font-primary-regular text-xs">
                            {moment(message.createdAt).format('HH:mm')}
                        </Text>
                        {message.status === MessageStatus.Pending && (
                            <Ionicons name="time-outline" size={14} color={'black'} />
                        )}
                        {message.status === MessageStatus.Sent && (
                            <Ionicons name="checkmark" size={14} color={'black'} />
                        )}
                        {message.status === MessageStatus.Delivered && (
                            <Ionicons name="checkmark-done" size={14} color={'black'} />
                        )}
                        {message.status === MessageStatus.Read && (
                            <Ionicons name="checkmark-done" size={14} color={'black'} />
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {anchor && (
                <Menu
                    contentStyle={styles.Menu}
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={{ x: anchor.x, y: anchor.y + 30 }}
                >
                    <Menu.Item
                        style={styles.MenuItem}
                        titleStyle={styles.MenuTitle}
                        onPress={() => handleCopy(message.content)}
                        title="Copy"
                    />
                </Menu>
            )}
        </View>
    );
}
