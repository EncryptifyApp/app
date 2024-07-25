import React, { useEffect, useState } from 'react';
import { useStorageState } from '../utils/useStorageState';
import { User, useAuthenticatedUserQuery } from '../generated/graphql';
import UserService from '../services/UserService';
import useChatStore from './useChatStore';
import { useConnection } from './useConnection';

export const AuthContext = React.createContext<{
  authenticateUser: (sessionToken: string) => void;
  signOut: () => void;
  user: User | null;
  subscriptionEndDate: Date | null;
  session?: string | null;
  isLoading: boolean;
  fetching: boolean;
} | null>({
  authenticateUser: async (sessionToken: string) => { },
  signOut: async () => { },
  user: null,
  subscriptionEndDate: null,
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
  const { fetchData, setSyncing, clearChats } = useChatStore();
  const { isConnected } = useConnection();
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [result, executeQuery] = useAuthenticatedUserQuery();

  const { data, fetching } = result;


  useEffect(() => {
    if (data?.authenticatedUser?.user && data?.authenticatedUser?.subscriptionEndDate) {
      setUser(data.authenticatedUser.user);
      setSubscriptionEndDate(data.authenticatedUser.subscriptionEndDate);

      UserService.storeUserLocally(data.authenticatedUser.user);
      UserService.storeSubscriptionEndDateLocally(data.authenticatedUser.subscriptionEndDate);
    }
  }, [data, fetching]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await UserService.getLocalUser();
      const subscriptionEndDate = await UserService.getSubscriptionEndDateLocally();
      setUser(user);
      setSubscriptionEndDate(subscriptionEndDate);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user && session) {
      fetchData(user, isConnected, session!);
    }

    if (!isLoading && !session) {
      setSyncing(false);
    }
  }, [user, fetching, session, isLoading, isConnected]);

  return (
    <AuthContext.Provider
      value={{
        authenticateUser: (sessionToken: string) => {
          // Perform sign-in logic here
          setSession(sessionToken);
          executeQuery();
        },
        signOut: () => {
          clearChats();
          UserService.clearLocalUser();
          setSession(null);
        },
        user,
        subscriptionEndDate,
        session,
        isLoading,
        fetching
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}