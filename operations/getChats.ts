// services/getChatById.ts
import { createClient, gql } from 'urql';
import { httpUrl } from '../config';
import { MessageStatus } from '../__generated__/graphql';

// Define the types for the query response and variables
interface GetChatsResponse {
  chats: {
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


const GET_CHATS = gql`
  query Chats {
    chats {
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

export const getChats = async (session: string) => {
  const client = createClient({
    url: httpUrl,
    fetchOptions: () => ({
      headers: { authorization: session ? `${session}` : '' },
    }),
  });

  const response = await client.query<GetChatsResponse>(GET_CHATS).toPromise();

  if (response.error) {
    throw new Error('An error occurred while fetching chats');
  }

  return response.data?.chats;
};

export default getChats;