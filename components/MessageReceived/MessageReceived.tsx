import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { Message } from '../../__generated__/graphql';
import * as Clipboard from 'expo-clipboard';
import { Menu } from 'react-native-paper';
import { styles } from '../../styles/ItemMenuStyles';

interface Props {
    message: Message;
}

const MessageReceived: React.FC<Props> = ({ message }) => {
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
                className="justify-start items-start mb-2"
            >
                <View className="bg-steel-gray rounded-xl px-2 py-1 max-w-xs">
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

            {anchor && (
                <Menu
                    contentStyle={styles.Menu}
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={{ x: anchor.x, y: anchor.y + 25 }}
                >
                    <Menu.Item
                    style={styles.MenuItem}
                    titleStyle={styles.MenuTitle}
                    onPress={() => handleCopy(message.content)} title="Copy" />
                </Menu>
            )}
        </View>
    );
};

export default MessageReceived;
