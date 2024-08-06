import React, { useState } from 'react';
import { Image, SafeAreaView, StatusBar, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import Header from '../../../components/Header';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import MenuItem from '../../../components/MenuItem';
import QRcode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useSession } from '../../../context/useSession';
import { User } from '../../../__generated__/graphql';
import moment from 'moment';
import { router } from 'expo-router';

export default function Settings() {
    const { user, subscriptionEndDate, signOut } = useSession() as { user: User | null, subscriptionEndDate: Date | null, signOut: () => void };
    const [isQrVisible, setIsQrVisible] = useState(false);
    const [isIdCopied, setIsIdCopied] = useState<boolean>(false);

    const handleQrPress = () => {
        setIsQrVisible(true);
    };

    const handleCloseQr = () => {
        setIsQrVisible(false);
    };

    const handleCopyId = async () => {
        await Clipboard.setStringAsync(user!.id!)
            .then(() => {
                setIsIdCopied(true);
            });
    };

    const handleSignOut = () => {
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
                        signOut();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    if (!user) return <View className="flex-1 bg-midnight-black"></View>;

    const now = moment();
    const subscriptionDate = moment(subscriptionEndDate);
    const isExpired = now.isAfter(subscriptionDate);
    const formattedDate = subscriptionDate.format('DD MMM YYYY');

    const profileSource = user?.profileUrl
        ? { uri: user.profileUrl }
        : require("../../../assets/images/logo.png");

    return (
        <View className="flex-1 bg-midnight-black">
            <SafeAreaView className="flex flex-col bg-steel-gray justify-start pt-8">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}
                />
                {/* Header */}
                <Header title="Settings" backButtonPath={"/"} />

                {/* Menu */}
                <ScrollView showsHorizontalScrollIndicator={false} className='bg-midnight-black'>
                    {/* Menu profile */}
                    <View className='flex flex-row justify-between items-center py-5 px-5 border-b border-steel-gray'>
                        <View className='flex flex-row items-center space-x-4'>
                            <Image source={profileSource}
                                className="w-16 h-16 rounded-full" />
                            <View>
                                <Text className='font-primary-semibold text-white text-lg'>{user.username}</Text>
                                {/* subscription end date */}
                                <Text className='font-primary-regular text-gray-300 text-sm'>
                                    Valid until:
                                    {isExpired ? (
                                        <Text className='font-primary-semibold text-red-500'> Expired</Text>
                                    ) : (
                                        <Text className='font-primary-semibold'> {formattedDate}</Text>
                                    )}
                                </Text>
                            </View>
                        </View>

                        <View className='flex flex-row space-x-5'>
                            <TouchableOpacity onPress={handleQrPress}>
                                <Ionicons size={22} name='qr-code' color={"#00e701"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu items */}
                    {/* Manage encryption keys */}
                    {/* <MenuItem
                        title="Encryption"
                        description="Manage your encryption keys"
                        icon={<Ionicons size={28} name='key-outline' color="#474f54" />}
                    /> */}
                    <MenuItem
                        onClick={() => router.push('/settings/readReceipts')}
                        title="Read Receipts"
                        description='Control who can see when you read their messages'
                        icon={<Ionicons size={28} name='eye-off-outline' color="#474f54" />}
                    />
                    <MenuItem
                        onClick={() => router.push('/settings/typing')}
                        title="Hide Typing"
                        description="Control who can see when you're typing"
                        icon={<Entypo size={28} name='dots-three-horizontal' color="#474f54" />}
                    />
                    {/* <MenuItem
                        title="Privacy"
                        description="Block contacts, dissapearing messages"
                        icon={<Ionicons size={28} name='lock-closed-outline' color="#474f54" />}
                    /> */}
                    
                    {/* <MenuItem
                        title="Storage"
                        description="Manage your storage usage"
                        icon={<Ionicons size={28} name='cloud-upload-outline' color="#474f54" />}
                    /> */}
                    {/* <MenuItem
                        title="Notifications"
                        description="Control your notifications"
                        icon={<Ionicons size={28} name='notifications-outline' color="#474f54" />}
                    /> */}
                    {/* <MenuItem
                        title="Help"
                        description="Get help with the app"
                        icon={<Ionicons size={28} name='help-circle-outline' color="#474f54" />}
                    />
                    <MenuItem
                        title="About"
                        description="Learn more about the app"
                        icon={<Ionicons size={28} name='information-circle-outline' color="#474f54" />}
                    /> */}
                    <MenuItem
                        title="Sign out"
                        description="This will wipe all your data from this device"
                        icon={<Ionicons size={28} name='log-out-outline' color="#ff4d4f" />}
                        onClick={handleSignOut}
                    />
                </ScrollView>
            </SafeAreaView>

            {/* QR Code Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isQrVisible}
                onRequestClose={handleCloseQr}
            >
                <TouchableWithoutFeedback onPress={handleCloseQr}>
                    <View className='flex-1 justify-end items-center'>
                        <TouchableWithoutFeedback>
                            <View className='py-4 px-24 bg-stormy-gray space-y-4 rounded-t-3xl'>
                                <View className='bg-midnight-black w-14 h-2 rounded-full mx-auto mb-5'></View>
                                {/* QR Code Image */}
                                <View className='flex items-center p-2 bg-white rounded-lg mx-10'>
                                    <QRcode
                                        value={user?.id!}
                                        logo={require('../../../assets/images/logo.png')}
                                        logoSize={30}
                                        size={120}
                                        logoBackgroundColor='transparent'
                                    />
                                </View>
                                <View className='flex flex-row items-center justify-center'>
                                    <View className='bg-midnight-black h-0.5 w-1/2'></View>
                                </View>
                                {/* id Display */}
                                <View className="flex-row items-center">
                                    <Text
                                        className="flex-1 py-2 px-5 text-white text-lg font-primary-regular rounded-md bg-steel-gray mr-2"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {user?.id}
                                    </Text>
                                    <TouchableOpacity onPress={handleCopyId}>
                                        {isIdCopied ? (
                                            <Feather name="check" size={24} color="white" />
                                        ) : (
                                            <Feather name="copy" size={24} color="white" />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <Text className='text-center text-gray-200 font-primary-semibold mt-5 text-sm'>
                                    Your QR code is private. If you share it with someone, they will be able to start a chat with you.
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
