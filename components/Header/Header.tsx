import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Loading from '../Loading';
import { router, usePathname } from 'expo-router';
import { styles } from '../../styles/HeaderMenuStyle';

interface Props {
    syncing?: boolean;
    title: string;
    backButtonPath?: string;
}

const Header = ({ syncing, title, backButtonPath}: Props) => {
    const pathname = usePathname();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const openMenu = () => setIsMenuVisible(true);
    const closeMenu = () => setIsMenuVisible(false);


    return (
        <View className="bg-steel-gray py-2">
            {syncing && <Loading />}
            <View className="flex-row justify-between py-3 space-x-2 items-center px-4">

                <View className='flex flex-row space-x-3'>
                    {
                        backButtonPath &&
                        <TouchableOpacity onPress={() => router.replace(backButtonPath)}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                    }
                    <Text className="font-primary-semibold text-white text-xl">{title}</Text>
                </View>
                {
                    !pathname.includes('/settings') && <Menu
                    visible={isMenuVisible}
                    onDismiss={closeMenu}
                    contentStyle={styles.Menu}
                    anchor={
                        <TouchableOpacity onPress={openMenu}>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color="gray" />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item
                        title="Settings"
                        style={styles.MenuItem}
                        titleStyle={styles.MenuTitle}
                        onPress={() => {
                            router.push('/settings');
                            closeMenu();
                        }} />
                </Menu>
                }
                
            </View>
        </View>
    );
};

export default Header;