import AsyncStorage from "@react-native-async-storage/async-storage";


class NoteService {

    NOTE_KEY = 'NOTES_KEY';

    async saveNote(chatId: string, note: string) {
        try {
            await AsyncStorage.setItem(`${this.NOTE_KEY}-${chatId}`, note);
        } catch (error) {
            console.error('Error saving note to storage:', error);
            throw error;
        }
    }

    async getNoteByChatId(chatId: string) {
        try {
            const note = await AsyncStorage.getItem(`${this.NOTE_KEY}-${chatId}`);
            return note;
        } catch (error) {
            console.error('Error getting note from storage:', error);
            throw error;
        }
    }
}

export default new NoteService();