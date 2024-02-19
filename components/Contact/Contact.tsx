import React from 'react'
import { View, Text } from 'react-native'
import { User } from '../../generated/graphql'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { router } from 'expo-router'

interface Props {
    contact:User
}
export default function Contact({contact}:Props) {
 
    return (
            <TouchableOpacity onPress={() => {
                router.push({ pathname: "/chat", params: contact});
              }} className='flex flex-row'>
                {/* <Image source={user.profileUrl ? user.profileUrl : require("../../assets/logo.png")} className='w-14 h-14 rounded-2xl' /> */}
                <View>
                    <Text className='text-white font-primary-bold text-lg'>{contact.username}</Text>
                    <Text className='text-gray-400 font-primary-regular text-sm'>{contact.publicKey}</Text>
                </View>
            </TouchableOpacity>
        
    )
}
