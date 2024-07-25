import { createClient, gql } from 'urql';
import { httpUrl } from '../config';


// Define the types for the query response and variables
interface GetAuthUserResponse {
    authenticatedUser: {
        user: {
        id: string;
        username: string;
        profileUrl: string;
        publicKey: string;
        };
        subscriptionEndDate: string;
    };
}


const GET_AUTH_USER = gql`
    query AuthenticatedUser {
        authenticatedUser {
            user {
                id
                username
                profileUrl
                publicKey
            }
            subscriptionEndDate
            error {
                field
                message
            }
        }
    }
`;

export const getAuthUser = async (session: string) => {
  const client = createClient({
    url: httpUrl,
    fetchOptions: () => ({
      headers: { authorization: session ? `${session}` : '' },
    }),
  });

  const response = await client.query<GetAuthUserResponse>(GET_AUTH_USER).toPromise();

  if (response.error) {
    throw new Error('An error occurred while fetching Authenticated User');
  }

  return response.data?.authenticatedUser;
};

export default getAuthUser;