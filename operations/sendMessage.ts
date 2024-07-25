// services/sendMessage.ts
import { createClient, gql } from 'urql';
import { httpUrl } from '../config';

// Define the types for the mutation response and variables
interface SendMessageResponse {
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

interface SendMessageVariables {
  toUserId: string;
  content: string;
}


const SEND_MESSAGE = gql`
  mutation SendMessage($toUserId: String!, $content: String!) {
    sendMessage(toUserId: $toUserId, content: $content) {
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

export const sendMessage = async (session:string,toUserId: string, content: string) => {
  // Create a client instance
  const client = createClient({
    url: httpUrl,
    fetchOptions: () => {
      return {
        headers: { authorization: session ? `${session}` : '' },
      };
    },
  });


  const variables: SendMessageVariables = { toUserId, content };

  const response = await client.mutation<SendMessageResponse, SendMessageVariables>(SEND_MESSAGE, variables).toPromise();

  if (response.error) {
    console.error('Error sending message:', response.error);
    return null;
  }

  return response.data?.sendMessage;
};