import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message } from '../generated/graphql';

class ChatService {

  CHATS_KEY = 'chats';

  async storeMessagesLocally(chats:Chat[]) {
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
      } else {
        // Chat not found, create a new chat object
        const newChat = {
          id: message.chat?.id,
          messages: [message],
          // Add other properties from the new message's chat if needed
        };
  
        chats.push(newChat);
      }
  
      // Store the updated chats locally
      await this.storeMessagesLocally(chats);
    } catch (error) {
      console.error('Error adding message to chat locally:', error);
      throw error;
    }
  }
  
  
  async getLocalChat(id:string): Promise<Chat> {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      const chats = storedValue ? JSON.parse(storedValue) : [];
      const chat = chats.find((chat:Chat) => chat.id === id)
      return chat;
    } catch (error) {
      console.error('Error getting locally stored messages:', error);
      throw error;
    }
  }

  async getLocalChats() {
    try {
      const storedValue = await AsyncStorage.getItem(this.CHATS_KEY);
      return storedValue ? JSON.parse(storedValue) : [];
    } catch (error) {
      console.error('Error getting locally stored messages:', error);
      throw error;
    }
  }


  //TODO: Implement logic to sync messages with the server
  // async syncMessagesWithServer(chats:Chat[]) {
  //   try {
  //     //Implement logic to compare locally stored messages with server messages
  //     const locallyStoredMessages = await this.getLocalMessages();
  //     const serverMessages = chats;

  //     //Compare timestamps and identify new messages
  //     const newMessages = this.identifyNewMessages(locallyStoredMessages, serverMessages);

  //     //Update locally stored messages with new messages
  //     const updatedMessages = [...locallyStoredMessages, ...newMessages];
  //     await this.storeMessagesLocally(updatedMessages);

  //     //Sync new messages with the server
  //     await this.syncNewMessagesWithServer(newMessages);
  //   } catch (error) {
  //     console.error('Error syncing messages with the server:', error);
  //     throw error;
  //   }
  // }

  //TODO: Implement logic to compare timestamps and identify new messages
  // identifyNewMessages(localMessages, serverMessages) {
  //   // TODO: Implement logic to compare timestamps and identify new messages
  //   // For simplicity, assume all server messages are new for now
  //   return serverMessages;
  // }

  // async syncNewMessagesWithServer(newMessages) {
  //   // This function will be implemented in the calling component or service
  //   // to send new messages to the server.
  // }


}

export default new ChatService();
