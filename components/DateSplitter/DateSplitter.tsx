import {Text} from 'react-native'
import moment from 'moment'
import React from 'react'

interface Props {
    date: string
}

export default function DateSplitter({ date }: Props) {
    return (
        <Text className="text-center text-sm font-primary-semibold text-gray-300 mb-2">
            {date}
        </Text>
    )
}