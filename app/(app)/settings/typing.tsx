import React, { useState } from 'react'
import { View, SafeAreaView, StatusBar, Text, Switch } from 'react-native'
import Header from '../../../components/Header'

export default function Typing() {
    const [hideTyping, setHideTyping] = useState(false);
    const toggleHideTyping = () => setHideTyping(previousState => !previousState);



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
                <Header title="Hide Typing" backButtonPath={"/settings"} />

                {/* Menu */}
                <View className='bg-midnight-black'>
                    {/* dash */}
                    <View className='bg-steel-gray w-14 h-2 rounded-full mx-5 mt-4'></View>
                    {/* toggle hide seen */}
                    <View className='flex-row justify-between items-center px-4 py-5'>
                        <View className='flex w-3/4'>
                            <Text className='text-white text-lg font-primary-semibold'>Typing</Text>
                            <Text className='text-gray-200 text-sm font-primary-regular'>
                                If turned off, you won't send or receive typing notifications.
                                Typing notifications are always sent in groups chats.
                            </Text>
                        </View>
                        <Switch
                            disabled
                            trackColor={{ false: "#767577", true: "#191b1f" }}
                            thumbColor={hideTyping ? "#00e701" : "#767577"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleHideTyping}
                            value={hideTyping}
                        />

                    </View>


                </View>
            </SafeAreaView>

        </View>
    )

}
