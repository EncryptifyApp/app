import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Header from '../../components/Header';
import { Image } from 'expo-image';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import MenuItem from '../../components/MenuItem';
import QRcode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useSession } from '../../context/useSession';
import { User } from '../../generated/graphql';

export default function Settings() {
    const { user} = useSession() as { user: User | null};
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
                <Header title="Settings" />

                {/* Menu */}
                <ScrollView showsHorizontalScrollIndicator={false} className='bg-midnight-black'>
                    {/* Menu profile */}
                    <View className='flex flex-row justify-between items-center py-5 px-5 border-b border-steel-gray'>
                        <View className='flex flex-row items-center space-x-4'>
                            <Image source={user?.profileUrl || require('../../assets/images/logo.png')}
                                className="w-16 h-16 rounded-full" />
                            <Text className='font-primary-semibold text-white text-lg'>{user?.username}</Text>
                        </View>

                        <View className='flex flex-row space-x-5'>
                            <TouchableOpacity onPress={handleQrPress}>
                                <Ionicons size={22} name='qr-code' color={"#00e701"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu items */}
                    <MenuItem
                        title="Settings"
                        description="Manage your app settings"
                        icon={<Ionicons size={20} name='settings-outline' color="#474f54" />}
                    />
                    <MenuItem
                        title="Profile"
                        description="View and edit your profile"
                        icon={<MaterialIcons size={20} name='person-outline' color="#474f54" />}
                    />
                    <MenuItem
                        title="Notifications"
                        description="Manage notification settings"
                        icon={<Ionicons size={20} name='notifications-outline' color="#474f54" />}
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
                            <View className='py-4 px-20 bg-stormy-gray space-y-4 rounded-t-3xl'>
                            <View className='bg-midnight-black w-14 h-2 rounded-full mx-auto mb-5'></View>
                                {/* QR Code Details */}
                                {/* <View className='flex flex-col items-center '>
                                    <Image source={require('../../assets/images/logo.png')} className='w-10 h-10 rounded-3xl' />
                                    <Text className='font-primary-bold text-white text-lg text-center'>{user?.username}</Text>
                                    <Text className='font-primary-semibold text-gray-300 text-base text-center'>Encryptify Contact</Text>
                                </View> */}

                                {/* QR Code Image */}
                                <View className='flex items-center p-2 bg-white rounded-lg mx-10'>
                                    <QRcode
                                        value={user?.id!}
                                        logo={require('../../assets/images/logo.png')}
                                        logoSize={30}
                                        size={120}
                                        logoBackgroundColor='transparent'
                                    />
                                </View>
                                {/* make a splitter with or in the middle */}
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
