import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../generated/graphql";


class UserService {
    USER_KEY = 'user';
    SUBSCRIPTION_END_DATE_KEY = 'subscriptionEndDate';
    //store user data in local storage
    async storeUserLocally(user: User) {
        try {
            await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error storing user locally:', error);
            throw error;
        }
    }

    //store subscription end date in local storage
    async storeSubscriptionEndDateLocally(subscriptionEndDate: Date) {
        try {
            await AsyncStorage.setItem(this.SUBSCRIPTION_END_DATE_KEY, JSON.stringify(subscriptionEndDate));
        } catch (error) {
            console.error('Error storing subscription end date locally:', error);
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

    //get subscription end date from local storage
    async getSubscriptionEndDateLocally(): Promise<Date | null> {
        try {
            const storedValue = await AsyncStorage.getItem(this.SUBSCRIPTION_END_DATE_KEY);
            return storedValue ? new Date(JSON.parse(storedValue)) : null;
        } catch (error) {
            console.error('Error getting locally stored subscription end date:', error);
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