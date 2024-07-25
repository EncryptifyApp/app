// services/getChatById.ts
import { createClient, gql } from 'urql';
import { httpUrl } from '../config';
import { MessageStatus } from '../__generated__/graphql';

// Define the types for the query response and variables
interface GetChatByIdResponse {
  chat: {
    id: string;
    members: {
      id: string;
      username: string;
      profileUrl: string;
      publicKey: string;
    }[];
    messages: {
      id: string;
      content: string;
      createdAt: string;
      status: MessageStatus;
      sender: {
        id: string;
        username: string;
        profileUrl: string;
        publicKey: string;
      };
    }[];
  };
}

interface GetChatByIdVariables {
  chatId: string;
}

const GET_CHAT_BY_ID = gql`
  query GetChatById($chatId: String!) {
    chat(id: $chatId) {
      id
      members {
        id
        username
        profileUrl
        publicKey
      }
      messages {
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
  }
`;

export const getChatById = async (session:string, chatId: string) => {
   // Create a client instance
   const client = createClient({
    url: httpUrl,
    fetchOptions: () => {
      return {
        headers: { authorization: session ? `${session}` : '' },
      };
    },
  });

  const variables: GetChatByIdVariables = { chatId };

  const response = await client.query<GetChatByIdResponse>(GET_CHAT_BY_ID, variables
  ).toPromise();

  if (response.error) {
    console.error('An error occurred while fetching chat by id:', response.error);
    return null;
  }

  return response.data?.chat;
}

export default getChatById;