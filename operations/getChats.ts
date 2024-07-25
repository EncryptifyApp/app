// services/getChatById.ts
import { createClient, gql } from 'urql';
import { httpUrl } from '../config';
import { MessageStatus } from '../generated/graphql';

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

export const getChats = async (session:string) => {
   // Create a client instance
   const client = createClient({
    url: httpUrl,
    fetchOptions: () => {
      return {
        headers: { authorization: session ? `${session}` : '' },
      };
    },
  });


  const response = await client.query<GetChatsResponse>(GET_CHATS
  ).toPromise();

  if (response.error) {
    console.error('An error occurred while fetching chats:', response.error);
    return null;
  }

  return response.data?.chats;
}

export default getChats;