import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Loading from '../Loading';
import { router } from 'expo-router';
import { useSession } from '../../context/useSession';

interface Props {
    syncing?: boolean;
    title: string;
}

const Header = ({ syncing, title }: Props) => {
    const { signOut } = useSession() as { signOut: () => void };
    // const { clearChats } = useChatStore();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const openMenu = () => setIsMenuVisible(true);
    const closeMenu = () => setIsMenuVisible(false);

    const AlertUserOnSignOut = () => {
        Alert.alert(
            'Sign out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'OK', onPress: () => {
                        // clearChats();
                        signOut()
                    }
                }
            ],
            { cancelable: true }
        );
    }

    return (

        <View className="bg-steel-gray py-2">
            {syncing && <Loading />}
            <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                <View className="flex">
                    <Text className="font-primary-semibold text-white text-xl">{title}</Text>
                </View>

                <Menu
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
                    <Menu.Item
                        title="Sign out"
                        style={styles.MenuItem}
                        titleStyle={[styles.MenuTitle, { color: '#ff4d4f' }]}
                        onPress={AlertUserOnSignOut}
                    />


                </Menu>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    Menu: {
        backgroundColor: '#191b1f',
        padding: 0
    },
    MenuItem: {
        height: 50,
        backgroundColor: '#191b1f',
    },
    MenuTitle: {
        fontFamily: 'Rajdhani_600SemiBold',
        color: 'white',
        fontSize: 16,
    }


});

export default Header;
