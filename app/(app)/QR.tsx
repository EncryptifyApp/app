import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, StatusBar, Alert, Modal } from 'react-native'
import QRcode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { useSession } from '../../context/useSession';
import { Chat, User, useGetChatbyUserIdQuery } from '../../generated/graphql';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import { useChat } from '../../context/useChat';



export default function QR() {
    const router = useRouter();
    const { user } = useSession() as { user: User | null };
    const {getChat, addNewChat} = useChat() as {getChat: (id: string) => Chat | undefined, addNewChat: (chat: Chat) => void};
    const [tabSelected, setTabSelected] = useState<"MYQR" | "SCANQR">("MYQR");

    //user to be scanned
    const [id, setId] = useState<string>('');


    const [result, reexecuteQuery] = useGetChatbyUserIdQuery({ variables: { id: id }, pause: id === '' });
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
        const id = data;
        if (typeof id === 'string') {
            setId(id);
            reexecuteQuery();
        }
    };


    useEffect(() => {
        const handleBarCodeScanned = () => {
            if (result.data) {
                if(result.data.getChatbyUserId === null){
                    Alert.alert("Not a valid QR code", "The user you are trying to reach is not found. Please try again", [
                        {
                            text: "OK",
                            onPress: () => setScanned(false)
                        }
                    ]);

                    return;
                }
                //get the chat
                const chatId = result.data.getChatbyUserId?.id;
                const chat = getChat(chatId!);
                if (chat) {
                    //navigate the user to the chat screen
                    router.push({ pathname: "/chat", params: { chatId: chatId } });
                }
                else {
                    addNewChat(result.data.getChatbyUserId!);
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
                <View className='bg-steel-gray py-2'>

                    <View className="">
                        <View className="flex flex-row justify-between py-3 items-center pl-4 pr-3">
                            <Text className="font-primary-semibold text-white text-xl">
                                QR code
                            </Text>
                            {/* three dots icon */}
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="dots-vertical" size={28} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


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
                            <View className='bg-steel-gray w-1.5 h-14 mt-4'></View>
                            <TouchableOpacity
                                onPress={() => setTabSelected('SCANQR')}
                                className={`border-b-2 ${tabSelected === 'SCANQR' ? 'border-primary' : ''}`}
                            >
                                <Text className="font-primary-semibold text-white text-lg">Scan QR</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <AntDesign name="search1" size={24} color="gray" /> */}
                    </View>

                    {/* My QR code */}
                    {
                        tabSelected === 'MYQR' && <View className='flex flex-col justify-center items-center'>
                            <View className='py-5 px-8 bg-stormy-gray rounded-lg space-y-5'>
                                <View className='flex flex-col items-center'>
                                    <Image source={require('../../assets/images/logo.png')} className='w-10 h-10 rounded-3xl' />
                                    <Text className='font-primary-bold text-white text-lg text-center'>{user?.username}</Text>
                                    <Text className='font-primary-semibold text-gray-300 text-base text-center'>Encryptify Contact</Text>
                                </View>
                                <View className='rounded-2xl p-2 bg-white'>
                                    <QRcode
                                        value={user?.id!}
                                        logo={require('../../assets/images/logo.png')}
                                        logoSize={30}
                                        size={200}
                                        logoBackgroundColor='transparent'
                                    />
                                </View>
                            </View>
                            <Text className='text-center text-gray-200 font-primary-medium mx-10 mt-10 text-base'>
                                Your QR code is private. if you share it with someone, they will be able to see your profile and send you a message.
                            </Text>
                        </View>
                    }
                    {/* Scan QR code */}
                    {tabSelected === 'SCANQR' && (
                        hasPermission ? (
                            <>
                                <Text className='text-xl font-primary-semibold text-white text-center'>Scan the QR code</Text>
                                <BarCodeScanner
                                    className="h-full w-full my-auto"
                                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                                />
                            </>

                        ) : (
                            <View className='flex items-center pt-32 bg-midnight-black space-y-5'>
                                <Text className='text-2xl font-primary-semibold text-white text-center'>Waiting for camera permission</Text>
                            </View>
                        )
                    )}

                </View>
            </SafeAreaView >
        </View >
    )
}
