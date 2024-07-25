import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message, MessageStatus } from '../__generated__/graphql';

class ChatService {

  CHATS_KEY = 'chats';

  async storeChatsLocally(chats: Chat[]) {
    try {
      const jsonValue = JSON.stringify(chats);
      await AsyncStorage.setItem(this.CHATS_KEY, jsonValue);
    } catch (error) {
      console.error('Error storing messages locally:', error);
      throw error;
    }
  }


  async addMessageToChatStorage(message: Message) {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = storedValue ? JSON.parse(storedValue) : [];
      const chatIndex = chats.findIndex((chat: Chat) => chat.id === message.chat?.id);

      if (chatIndex !== -1) {
        // Chat found, add the new message to the existing chat's messages array
        chats[chatIndex].messages.push(message);

        // Store the updated chats locally
        await this.storeChatsLocally(chats);
      }

    } catch (error) {
      console.error('Error adding message to chat locally:', error);
      throw error;
    }
  }


  async getLocalChat(id: string): Promise<Chat> {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = storedValue ? JSON.parse(storedValue) : [];
      const chat = chats.find((chat: Chat) => chat.id === id)
      return chat;
    } catch (error) {
      console.error('Error getting locally stored messages:', error);
      throw error;
    }
  }

  async getLocalChats() {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = JSON.parse(storedValue || '[]');
      return chats;
    } catch (error) {
      console.error('Error getting locally stored messages:', error);
      throw error;
    }
  }


  async addChatToStorage(newChat: Chat) {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = storedValue ? JSON.parse(storedValue) : [];
      chats.unshift(newChat);
      await this.storeChatsLocally(chats);
    } catch (error) {
      console.error('Error adding chat to storage:', error);
      throw error;
    }
  }

  async clearChats() {
    try {
      await AsyncStorage.removeItem(this.CHATS_KEY);
    } catch (error) {
      console.error('Error clearing chats:', error);
      throw error;
    }
  }


  async updateMessageStatus(messageTempId: string,id:string, createdAt: Date) {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = storedValue ? JSON.parse(storedValue) : [];
      const chatIndex = chats.findIndex((chat: Chat) => chat.messages!.find((message: Message) => message.id === messageTempId));

      if (chatIndex !== -1) {
        const chat = chats[chatIndex];
        const messageIndex = chat.messages.findIndex((message: Message) => message.id === messageTempId);

        if (messageIndex !== -1) {
          chat.messages[messageIndex].id = id;
          chat.messages[messageIndex].status = MessageStatus.Sent;
          chat.messages[messageIndex].createdAt = createdAt;
          chats.splice(chatIndex, 1);
          chats.unshift(chat);
          await this.storeChatsLocally(chats);
        }
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
    
  }

  //get all pending messages
  async getPendingMessages(): Promise<Message[]> {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = storedValue ? JSON.parse(storedValue) : [];
      
      // Check if chats are not empty
      if (!chats || chats.length === 0) return [];
  
      // Filter for pending messages
      const pendingMessages = chats
        .filter((chat: Chat) => chat.messages && chat.messages.length > 0)
        .map((chat: Chat) => chat.messages!.filter((message: Message) => message.status === MessageStatus.Pending))
        .flat();
  
      return pendingMessages;
    } catch (error) {
      console.error('Error getting pending messages:', error);
      throw error;
    }
  }

}

export default new ChatService();