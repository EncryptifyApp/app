import { createClient, gql } from 'urql';
import { httpUrl } from '../config';

// Define the types for the mutation response and variables
interface SendPendingMessagesResponse {
  sendMessage: {
    id: string;
    content: string;
    createdAt: string;
    status: string;
    sender: {
      id: string;
      username: string;
      profileUrl: string;
      publicKey: string;
    };
  };
}

interface SendPendingMessagesVariables {
  content: string;
  chatId: string;
}


const SEND_PENIDNG_MESSAGES = gql`
  mutation SendPendingMessage($chatId: String!, $content: String!) {
    sendPendingMessage(chatId: $chatId, content: $content) {
      id
      content
      createdAt
      status
      sender {
        id
        username
        profileUrl
        publicKey
      }
    }
  }
`;

export const sendPendingMessage = async (session:string,chatId: string, content: string) => {
  // Create a client instance
  const client = createClient({
    url: httpUrl,
    fetchOptions: () => {
      return {
        headers: { authorization: session ? `${session}` : '' },
      };
    },
  });


  const variables: SendPendingMessagesVariables = { chatId, content };

  const response = await client.mutation<SendPendingMessagesResponse, SendPendingMessagesVariables>(SEND_PENIDNG_MESSAGES, variables).toPromise();

  if (response.error) {
    console.error('Error sending message:', response.error);
    return null;
  }

  return response.data?.sendMessage;
};