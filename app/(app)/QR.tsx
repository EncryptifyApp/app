import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, StatusBar, Alert } from 'react-native'
import QRcode from 'react-native-qrcode-svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { useSession } from '../../context/useSession';
import { Chat, User, useGetChatbyUserKeyQuery } from '../../generated/graphql';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import { useChat } from '../../context/useChat';
import Header from '../../components/Header';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';


export default function QR() {
    const router = useRouter();
    const { user } = useSession() as { user: User | null };
    const { getChat, addNewChat } = useChat() as { getChat: (id: string) => Chat | undefined, addNewChat: (chat: Chat) => void };
    const [tabSelected, setTabSelected] = useState<"MYQR" | "SCANQR">("MYQR");

    //user to be scanned
    const [licenseKey, setLicenseKey] = useState<string>('');
    const [isLicenseKeyCopied, setIsLicenseKeyCopied] = useState<boolean>(false);


    const [result, reexecuteQuery] = useGetChatbyUserKeyQuery({ variables: { licenseKey: licenseKey }, pause: licenseKey === '' });
    //scanning the QR
    const [hasPermission, setHasPermission] = useState<any>();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (tabSelected === 'SCANQR') {
            const getBarCodeScannerPermissions = async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === 'granted');
            };

            getBarCodeScannerPermissions();
        }
    }, [tabSelected]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        const key = data;
        if (typeof key === 'string') {
            setLicenseKey(key);
            reexecuteQuery();
        }
    };


    const handleCopyLicenseKey = async () => {
        await Clipboard.setStringAsync(user!.licenseKey!)
            .then(() => {
                setIsLicenseKeyCopied(true);
            });
    };


    useEffect(() => {
        const handleBarCodeScanned = () => {
            if (result.data) {
                if (result.data.getChatbyUserKey === null) {
                    Alert.alert("Not a valid QR code", "The user you are trying to reach is not found. Please try again", [
                        {
                            text: "OK",
                            onPress: () => setScanned(false)
                        }
                    ]);

                    return;
                }
                //get the chat
                const chatId = result.data.getChatbyUserKey?.id;
                const chat = getChat(chatId!);
                if (chat) {
                    //navigate the user to the chat screen
                    router.push({ pathname: "/chat", params: { chatId: chatId } });
                }
                else {
                    addNewChat(result.data.getChatbyUserKey!);
                    router.push({ pathname: "/chat", params: { chatId: chatId } });
                }
            }
        }
        handleBarCodeScanned();
    }, [result])

    return (
        <View className="flex-1 bg-midnight-black">
    <SafeAreaView className="flex flex-col bg-steel-gray  justify-start pt-10">
        <StatusBar
            animated={true}
            backgroundColor="#191b1f"
            barStyle={"light-content"}
            showHideTransition={'fade'}
        />
        {/* Header */}
        <Header title="Add contact" />

        {/* Chats */}
        <View className='bg-midnight-black rounded-t-2xl'>
            {/* dash */}
            <View className='flex-1 bg-steel-gray w-14 h-2 rounded-full mx-auto mt-4'></View>
            {/* Header */}
            <View className="flex-col justify-center py-3 space-x-2 items-center px-4">
                <View className="flex flex-row justify-around items-center w-full">
                    <TouchableOpacity
                        onPress={() => setTabSelected('MYQR')}
                        className={`border-b-2 ${tabSelected === 'MYQR' ? 'border-primary' : ''}`}
                    >
                        <Text className="font-primary-semibold text-white text-lg">My QR</Text>
                    </TouchableOpacity>

                    <View className='bg-steel-gray w-1.5 h-14 mt-4 rounded-md'></View>

                    <TouchableOpacity
                        onPress={() => setTabSelected('SCANQR')}
                        className={`border-b-2 ${tabSelected === 'SCANQR' ? 'border-primary' : ''}`}
                    >
                        <Text className="font-primary-semibold text-white text-lg">Scan QR</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Content */}
            <View className='mt-10'>
                {/* My QR Code */}
                {tabSelected === 'MYQR' && (
                    <View className='flex justify-center items-center mx-auto'>
                        {/* Your QR code */}
                        <View className='py-4 px-16 bg-stormy-gray rounded-lg space-y-4'>
                            {/* QR Code Details */}
                            <View className='flex flex-col items-center justify-center'>
                                <Image source={require('../../assets/images/logo.png')} className='w-10 h-10 rounded-3xl' />
                                <Text className='font-primary-bold text-white text-lg text-center'>{user?.username}</Text>
                                <Text className='font-primary-semibold text-gray-300 text-base text-center'>Encryptify Contact</Text>
                            </View>
                            
                            {/* QR Code Image */}
                            <View className='flex flex-col justify-center items-center rounded-lg p-2 bg-white'>
                                <QRcode
                                    value={user?.licenseKey!}
                                    logo={require('../../assets/images/logo.png')}
                                    logoSize={30}
                                    size={120}
                                    logoBackgroundColor='transparent'
                                    backgroundColor='transparent'
                                />
                            </View>
                            {/* make a splitter with or in the middle */}
                            <View className='flex flex-row items-center justify-center'>
                                <View className='bg-steel-gray h-0.5 w-5'></View>
                                <Text className='text-white mx-2'>or</Text>
                                <View className='bg-steel-gray h-0.5 w-5'></View>
                            </View>
                            {/* License Key Display */}
                            <View className="flex-row items-center">
                                <Text className="flex-1 py-2 px-5 text-white text-lg font-primary-regular rounded-md bg-steel-gray mr-2">
                                    {user?.licenseKey}
                                </Text>
                                <TouchableOpacity onPress={handleCopyLicenseKey}>
                                    {isLicenseKeyCopied ? (
                                        <Feather name="check" size={24} color="white" />
                                    ) : (
                                        <Feather name="copy" size={24} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                        {/* Info Text */}
                        <Text className='text-center text-gray-200 font-primary-semibold mx-10 mt-5 text-sm'>
                            Your QR code is private. if you share it with someone, they will be able to start a chat with you.
                        </Text>
                    </View>
                )}

                {/* Scan QR code */}
                {tabSelected === 'SCANQR' && (
                    <View className="flex flex-col items-center h-full">
                        <Text className="text-xl font-primary-semibold text-white text-center mb-8">Scan the QR code</Text>
                        <View className="relative h-[300px] w-[500px]">
                            {/* Shadow effect */}
                            <View className="absolute inset-0 bg-gradient-to-r from-black to-transparent rounded-md shadow-md"></View>
                            {/* Square for scanning */}
                            <View className="absolute inset-0 border-2 border-white rounded-md"></View>
                            {/* BarCodeScanner */}
                            <BarCodeScanner
                                style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                            />
                        </View>
                    </View>
                )}
            </View>
        </View>
    </SafeAreaView >
</View >

    )
}
