import { Alert, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../context/useSession'
import { Message, User, useNewMessageSubscription } from '../../generated/graphql';
import React, { useEffect, useState } from 'react';
import Chat from '../../components/Chat';
import Widget from '../../components/Widget';
import Loading from '../../components/Loading';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useChat } from '../../context/useChat';
import Note from '../../components/Note';
import { useRouter } from 'expo-router';


export default function Index() {
    const router = useRouter();
    const { user, signOut } = useSession() as { signOut: () => void, user: User | null };
    const [tabSelected, setTabSelected] = useState<"chats" | "notes">('chats');
    const { syncing, chats, updateChats } = useChat() as { syncing: boolean, chats: any[], updateChats: (message: Message) => void };
    const [res] = useNewMessageSubscription();

    const [chatIdToUpdated, setChatIdToUpdated] = useState<string | null>(null);

    //TODO: remove this from here
    const [processedMessages, setProcessedMessages] = useState(new Set());
    useEffect(() => {
        if (!res.data?.newMessage || processedMessages.has(res.data.newMessage.id)) return;

        // Add the new message id to the set of processed messages
        setProcessedMessages(prevMessages => new Set(prevMessages).add(res.data!.newMessage.id));
        
        // Execute updateChats only for new messages
        setChatIdToUpdated(res.data.newMessage.chat?.id!);
        updateChats(res.data.newMessage);
    }, [res, processedMessages]);

    //Sign out
    const SignOut = () =>
        Alert.alert('Signing out', 'Do you want to sign out?', [
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
            },
            { text: 'Yes', onPress: () => signOut() },
        ]);

    if (!user) return;
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
                    {/* synicing animation */}
                    {syncing && <Loading />}
                    <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                        <View className="flex">
                            <Text className="font-primary-semibold text-white text-xl">
                                Pinned Chats
                            </Text>
                        </View>

                        {/* sign out button */}
                        <TouchableOpacity onPress={SignOut}>
                            <Text className='font-primary-bold text-red-500 uppercase'>Sign Out</Text>
                        </TouchableOpacity>
                        {/* <Image source={user?.profileUrl ? user.profileUrl : require("../../assets/logo.png")} className='w-8 h-8 rounded-2xl' /> */}
                    </View>
                    {/* Pinned Chats */}
                    <View className='flex flex-row flex-wrap'>
                        {/* <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View>
                        <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View> */}
                        {/* <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View>
                        <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View> */}
                    </View>
                </View>


                {/* Chats */}
                <View className='bg-midnight-black rounded-t-2xl'>
                    {/* dash */}
                    <View className='bg-steel-gray w-14 h-2 rounded-full mx-auto mt-4'></View>
                    {/* Header */}
                    <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                        <View>
                            <Text className="font-primary-semibold text-white text-xl">
                                {tabSelected === 'chats' ? "Recent chats" : "Private Notes"}
                            </Text>
                        </View>
                        <Button
                            icon={<MaterialCommunityIcons name="qrcode-scan" size={24} color="#00e701" />}
                            bgColor="steel-gray"
                            size={'small'}
                            width={'xmin'}
                            onPress={() => {
                                router.push('/QR');
                            }}
                        />

                        {/* <AntDesign name="search1" size={24} color="gray" /> */}
                    </View>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className='flex-row space-x-2 mx-4'>
                        <View>
                            <Widget text='Chats' onClick={() => setTabSelected("chats")} active={tabSelected == "chats"} />
                        </View>
                        <View>
                            <Widget text='Notes' onClick={() => setTabSelected("notes")} active={tabSelected == "notes"} />
                        </View>

                    </ScrollView>
                    {/* Chats */}
                    {
                        tabSelected === 'chats' && (
                            chats.length === 0 ? (
                                <View className='flex items-center pt-32 bg-midnight-black space-y-5'>
                                    <Text className='text-2xl font-primary-semibold text-white text-center'>You have no{"\n"} chats yet</Text>
                                    <Ionicons name="chatbox-ellipses-outline" size={38} color="white" />
                                </View>
                            ) :
                                <ScrollView
                                    className='mt-5 bg-midnight-black h-screen'>
                                    {
                                        chats.map((chat) => (
                                            <Chat key={chat.id} chat={chat} chatIdToUpdated={chatIdToUpdated}/>
                                        ))
                                    }
                                </ScrollView>
                        )
                    }
                    {/* Notes */}
                    {
                        tabSelected === 'notes' && (
                            <View className="grid gap-2 grid-cols-2 mt-5 mx-3 h-screen">
                                {[1, 2, 3, 4].map((index) => (
                                    // <Note key={index} />
                                    <View key={index}>
                                        <Note />
                                    </View>

))}
                            </View>

                        )
                    }

                </View>
            </SafeAreaView>
        </View>
    );
}