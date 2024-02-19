import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface Props {
    text: string,
    active?:boolean
}

export default function Widget({ text, active}: Props) {
    return (
        <TouchableOpacity className={`px-3 py-1 ${active ? 'bg-primary' :'bg-steel-gray'} rounded-md`}>
            <Text className={`${active ? "text-black" : "text-gray-500"} font-primary-semibold text-sm`}>{text}</Text>
        </TouchableOpacity>
    )
}
