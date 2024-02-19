import { AntDesign, FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { View, SafeAreaView, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native'
import Widget from '../../components/Widget'

import Button from '../../components/Button'
import { useUsersQuery } from '../../generated/graphql'
import Chat from '../../components/Chat'
import Contact from '../../components/Contact'

export default function contacts() {
    const [result] = useUsersQuery();

    const { data } = result;

    
    return (
        <View className="flex-1">
        <SafeAreaView className="flex flex-col bg-midnight-black  justify-start pt-10">
            <StatusBar
                animated={true}
                backgroundColor="#191b1f"
                barStyle={"light-content"}
                showHideTransition={'fade'}
            />


            {/* Chats */}
            <View className='bg-midnight-black'>
                <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                    <View className="flex">
                        <Text className="font-primary-bold text-white text-xl">
                            Contacts
                        </Text>
                    </View>
                    <AntDesign name="search1" size={24} color="gray" />
                </View>
                
                
                <ScrollView className='mt-5 bg-midnight-black h-screen'>

                    {
                        data?.users && data?.users.map((contact) => (
                            <Contact key={contact.id} contact={contact} />
                        ))
                    }
                </ScrollView>
               
            </View>
            
        </SafeAreaView>

    </View>
    )
}
