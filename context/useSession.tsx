import React, { useEffect, useState } from 'react';
import { useStorageState } from '../utils/useStorageState';
import { User, useAuthenticatedUserQuery } from '../generated/graphql';
import ChatService from '../services/ChatService';
import UserService from '../services/UserService';

export const AuthContext = React.createContext<{
  authenticateUser: (sessionToken: string) => void;
  signOut: () => void;
  user: User | null;
  session?: string | null;
  isLoading: boolean;
  fetching: boolean;
} | null>({
  authenticateUser: async (sessionToken: string) => { },
  signOut: async () => { },
  user: null,
  session: null,
  isLoading: true,
  fetching: true
});

export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  const [user, setUser] = useState<User | null>(null);
  const [result, reexecuteQuery] = useAuthenticatedUserQuery();

  const { data, fetching } = result;

  useEffect(() => {
    if (data?.authenticatedUser) {
      setUser(data.authenticatedUser);
      UserService.storeUserLocally(data.authenticatedUser);
    }
  }, [data, fetching]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await UserService.getLocalUser();
      setUser(user);
    };
  
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authenticateUser: (sessionToken: string) => {
          // Perform sign-in logic here
          setSession(sessionToken);
          reexecuteQuery();
        },
        signOut: () => {
          ChatService.clearChats();
          setSession(null);
          UserService.clearLocalUser();
        },
        user,
        session,
        isLoading,
        fetching
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}