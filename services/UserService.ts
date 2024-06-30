import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../generated/graphql";


class UserService {
    USER_KEY = 'user';
    //store user data in local storage
    async storeUserLocally(user: User) {
        try {
            await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error storing user locally:', error);
            throw error;
        }
    }

    //get user data from local storage
    async getLocalUser(): Promise<User | null> {
        try {
            const storedValue = await AsyncStorage.getItem(this.USER_KEY);
            return storedValue ? JSON.parse(storedValue) : null;
        } catch (error) {
            console.error('Error getting locally stored user:', error);
            throw error;
        }
    }

    //clear user data from local storage
    async clearLocalUser() {
        try {
            await AsyncStorage.removeItem(this.USER_KEY);
        } catch (error) {
            console.error('Error clearing user locally:', error);
            throw error;
        }
    }
}

export default new UserService();