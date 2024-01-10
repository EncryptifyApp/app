import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface Props {
    text: string,
    active?:boolean
}

export default function Widget({ text, active}: Props) {
    return (
        <TouchableOpacity className={`px-3 py-1 ${active ? 'bg-midnight-black' :'bg-steel-gray'} rounded-md`}>
            <Text className='text-gray-100 font-primary-semibold text-lg'>{text}</Text>
        </TouchableOpacity>
    )
}
