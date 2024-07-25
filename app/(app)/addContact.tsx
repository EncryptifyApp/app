import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useGetChatbyUserIdQuery } from '../../generated/graphql';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import Button from '../../components/Button';
import useChatStore from '../../context/useChatStore';

export default function AddContact() {
    const router = useRouter();
    const { getChat, addNewChat } = useChatStore();

    // User to be scanned
    const [id, setId] = useState<string>('');
    const [tab, setTab] = useState<'paste' | 'scan'>('paste');
    const [executeQuery, setExecuteQuery] = useState(false);

    const [result] = useGetChatbyUserIdQuery({ variables: { id: id }, pause: !executeQuery });
    // Scanning the QR
    const [hasPermission, setHasPermission] = useState<any>();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (tab === 'scan') {
            const getBarCodeScannerPermissions = async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === 'granted');
            };
            getBarCodeScannerPermissions();
        }
    }, [tab]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        const id = data;
        if (typeof id === 'string') {
            setId(id);
            setExecuteQuery(true);  // Enable query execution
        }
    };

    useEffect(() => {
        const handleQueryResult = () => {
            if (result.data) {
                if (result.data.getChatbyUserId === null) {
                    Alert.alert("User not found", "The user you are trying to reach is not found. Please try again", [
                        {
                            text: "OK",
                            onPress: () => setScanned(false)
                        }
                    ]);
                    setExecuteQuery(false); // Disable query execution
                    return;
                }
                // Get the chat
                const chatId = result.data.getChatbyUserId?.id;
                const chat = getChat(chatId!);
                if (chat) {
                    // Navigate the user to the chat screen
                    router.replace({ pathname: "/chat", params: { chatId: chatId } });
                } else {
                    addNewChat(result.data.getChatbyUserId!);
                    router.replace({ pathname: "/chat", params: { chatId: chatId } });
                }
                setExecuteQuery(false); // Disable query execution
            }
        };
        handleQueryResult();
    }, [result]);

    const handleAddById = () => {
        if (id.trim()) {
            setExecuteQuery(true);  // Enable query execution
        } else {
            return
        }
    };

    return (
        <View className="flex-1 bg-midnight-black">
            <SafeAreaView className="flex-1 bg-steel-gray pt-8">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}
                />

                {/* Header */}
                    <Header title="Add Contact" />

                {/* Tabs */}
                <View className="flex-row justify-around">
                    <TouchableOpacity
                        onPress={() => setTab('paste')}
                        className={`w-1/2  py-5 bg-midnight-black ${tab === 'paste' && 'border-b-2 border-primary'}`}
                    >
                        <Text className={`text-center text-lg  font-primary-semibold text-white`}>Paste ID</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab('scan')}
                        className={`w-1/2  py-5 bg-midnight-black ${tab === 'scan' && 'border-b-2 border-primary'}`}
                    >
                        <Text className={`text-center text-lg font-primary-semibold text-white`}>Scan QR</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {tab === 'paste' ? (
                    <View className="flex-1 items-center justify-center bg-black space-y-3 pb-16">
                        <Text className="font-primary-semibold text-white text-lg">Enter User ID</Text>
                        <TextInput
                            className="w-3/4 py-2 px-5 text-white text-base font-primary-regular mb-3 rounded-md bg-steel-gray"
                            placeholder="User ID"
                            placeholderTextColor={'#fff'}
                            value={id}
                            onChangeText={setId}
                        />
                        <Button 
                        text='Add' 
                        bgColor='primary'
                         weight='semibold' 
                         size={'large'} 
                         width={'min'} 
                         rounded='rounded-md'
                         onPress={handleAddById}
                        />
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        {hasPermission === null || hasPermission === false ? (
                            <Text className="text-xl font-primary-semibold text-white text-center mb-8">Requesting for camera permission</Text>
                        ) : (
                            <BarCodeScanner
                                style={{ flex: 1, width: '100%' }}
                                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                            />
                        )}

                        {/* Overlay */}
                        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                            <View className="h-[300px] w-[300px] border-2 rounded-xl border-white"></View>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
