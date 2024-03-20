import { Entypo } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, Image } from "react-native";

export default function PinnedChat() {
    return (

        <TouchableOpacity className="flex flex-col bg-midnight-black rounded-lg px-2 py-5 space-y-2">
            <View className="flex flex-row items-cente space-x-2">

                <Image className="w-6 h-6 rounded-full" source={require("../../assets/images/logo.png")} />
                <Text className="text-white text-center font-primary-semibold text-base">Mike</Text>
            </View>
            <View className="flex flex-row items-center space-x-2">
            <Entypo name="reply" size={12} color="gray" />
                <Text className="text-white text-center font-primary-regular text-sm">Call me when you can</Text>
            </View>
        </TouchableOpacity>
    )
}