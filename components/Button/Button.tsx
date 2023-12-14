import React from 'react'
import { Text, TouchableOpacity} from 'react-native'


interface Props {
    text:string
}


export default function Button({text}:Props) {
  return (
    <TouchableOpacity className='w-full py-4 px-8 bg-primary rounded-2xl'>
      <Text className='text-black text-center font-semibold text-lg '>
        {text}
      </Text>
    </TouchableOpacity>
  )
}