import { FontAwesome } from '@expo/vector-icons'
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
    console.log(data)
    return (
        <View className="flex-1 bg-steel-gray">
            <SafeAreaView className="flex flex-col  justify-start bg-steel-gray pt-10">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}

                />
                {/* Header */}

                <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                    <View className="flex">
                        <TouchableOpacity>
                            <Text className="font-primary-bold text-white text-xl">
                                Contacts
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Button
                        textColor={'black'}
                        bgColor={'primary'}
                        size={'small'}
                        width={'xmin'}
                        weight={'bold'}
                        onPress={() => {}}
                        icon={<FontAwesome name="search" size={18} />}
                    />
                </View>

                {/* Chats */}
                <ScrollView className='mt-5'>
                    {
                        data?.users && data?.users.map((user) => (
                            <Contact key={user.id} contact={user}/>
                        ))
                    }

                </ScrollView>
            </SafeAreaView>

        </View>
    )
}
