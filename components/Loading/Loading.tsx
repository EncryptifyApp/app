
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const Loading = () => {
    return <View className='bg-primary mx-auto rounded-full p-1'>
        <ActivityIndicator size="small" color="black" />
    </View>;
};

export default Loading;
