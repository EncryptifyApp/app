import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback } from 'react-native';
import Loading from '../Loading';
import { useSession } from '../../context/useSession';
import { Alert } from 'react-native';

interface Props {
    syncing?: boolean;
    title: string;
}

type DropdownOption = { label: string, onPress: () => void, destructive: boolean }[]

const Header = ({ syncing, title }: Props) => {
    const { signOut } = useSession() as { signOut: () => void };
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownOptions: DropdownOption = [
        {
            label: 'Settings',
            onPress: () => { },
            destructive: false,
        },
        {
            label: 'Sign out',
            onPress: () => AlertUserOnSignOut(),
            destructive: true,
        }
    ];

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const AlertUserOnSignOut = () => {
        Alert.alert(
            'Sign out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                { text: 'OK', onPress: () => signOut() }
            ],
            { cancelable: true }
        );
    }

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    return (
        <TouchableWithoutFeedback onPress={closeDropdown}>
            <View className="bg-steel-gray py-2 z-50">
                {/* syncing animation */}
                {syncing && <Loading />}
                <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                    <View className="flex">
                        <Text className="font-primary-semibold text-white text-xl">{title}</Text>
                    </View>

                    <TouchableOpacity onPress={toggleDropdown}>
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="gray" />
                    </TouchableOpacity>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <View className="absolute right-0 top-11 mr-4 bg-stormy-gray rounded shadow">
                            <FlatList
                                data={dropdownOptions}
                                keyExtractor={(item) => item.label}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className='px-6 py-3'
                                        onPress={() => item.onPress()}>
                                        <Text className={`font-primary-semibold text-base ${item.destructive ? "text-red-400" : "text-white"}`}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Header;
