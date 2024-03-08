import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, StatusBar } from 'react-native'
import QRcode from 'react-native-qrcode-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import { useSession } from '../../context/useSession';
import { User } from '../../generated/graphql';
import { Camera } from 'expo-camera';


export default function QR() {
    const { user } = useSession() as { user: User | null };
    const [tabSelected, setTabSelected] = useState<"MYQR" | "SCANQR">("MYQR");

    //scanning the QR
    const [hasPermission, setHasPermission] = useState<any>();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (tabSelected === 'SCANQR') {
            const getCameraPermissions = async () => {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === "granted");
            };
            getCameraPermissions();
        }
    }, [tabSelected]);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

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
                    <View className='bg-steel-gray w-14 h-2 rounded-full mx-auto mt-4'></View>
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
                            <View className='py-5 px-8 bg-stormy-gray rounded-lg flex flex-col items-center space-y-5'>

                                <Image source={require('../../assets/logo.png')} className='w-10 h-10 rounded-3xl' />
                                <View>
                                    <Text className='font-primary-bold text-white text-lg text-center'>{user?.username}</Text>
                                    <Text className='font-primary-semibold text-gray-300 text-base text-center'>Encryptify Contact</Text>
                                </View>
                                <View className='rounded-2xl p-2 bg-white'>
                                    <QRcode

                                        value={user?.id!}
                                        logo={require('../../assets/logo.png')}
                                        logoSize={40}
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
                    {
                        tabSelected === 'SCANQR' && (
                            hasPermission ? (
                                <View className='w-full h-screen'>
                                <Text className='text-white text-center font-primary-semibold text-2xl'>Scan the QR code</Text>
                                <Camera
                                barCodeScannerSettings={{
                                    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                                  }}
                                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                                    
                                />
                                </View>
                            ) : (
                                <View className='flex items-center pt-32 bg-midnight-black space-y-5'>
                                    <Text className='text-2xl font-primary-semibold text-white text-center'>Waiting for camer  permission</Text>
                                </View>
                            )
                        )
                    }

                </View>
            </SafeAreaView>
        </View>
    )
}
