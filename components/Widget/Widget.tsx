import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface Props {
    text: string,
    active?:boolean
    onClick?: () => void
}

export default function Widget({ text, active, onClick}: Props) {
    return (
        <TouchableOpacity onPress={onClick} className={`px-4 py-1 ${active ? 'bg-primary' :'bg-steel-gray'} rounded-md`}>
            <Text className={`${active ? "text-black" : "text-gray-500"} font-primary-semibold text-sm`}>{text}</Text>
        </TouchableOpacity>
    )
}
