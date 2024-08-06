import React, { useEffect, useState } from 'react';
import { clearStorageItem, useStorageState } from '../utils/useStorageState';
import { User } from '../__generated__/graphql';
import UserService from '../services/UserService';
import useChatStore from './useChatStore';
import { useConnection } from './useConnection';
import getAuthUser from '../operations/getAuthUser';
import { PRIVATE_KEY } from '../constants';

export const AuthContext = React.createContext<{
  authenticateUser: (sessionToken: string) => void;
  signOut: () => void;
  user: User | null;
  subscriptionEndDate: Date | null;
  session?: string | null;
  isLoading: boolean;
} | null>({
  authenticateUser: async (sessionToken: string) => { },
  signOut: async () => { },
  user: null,
  subscriptionEndDate: null,
  session: null,
  isLoading: true,
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


  const fetchUser = async () => {
    if (session) {
      if (isConnected) {
        const response = await getAuthUser(session);
        if (response) {
          setUser(response.user);
          setSubscriptionEndDate(new Date(response.subscriptionEndDate));
          UserService.storeUserLocally(response.user);
          UserService.storeSubscriptionEndDateLocally(new Date(response.subscriptionEndDate));
        }
      } else {
        const user = await UserService.getLocalUser();
        const subscriptionEndDate = await UserService.getSubscriptionEndDateLocally();
        setUser(user);
        setSubscriptionEndDate(subscriptionEndDate);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [session,isConnected]);

  const signOut = async () => {
    // clear chats from state and storage
    clearChats();
    // clear state
    setSession(null);
    setUser(null);
    setSubscriptionEndDate(null);
    //clear private key
    await clearStorageItem(PRIVATE_KEY);
    // clear local storage
    await UserService.clearLocalUser();
  }

  useEffect(() => {
    if (user && session) {
      const fetch = async () => {
        try {
          await fetchData(user, isConnected, session);
        } catch (error) {
          signOut();
        }
      };

      fetch();
    }

    if (!isLoading && !session) {
      setSyncing(false);
    }
  }, [user, session, isConnected, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        authenticateUser: async (sessionToken: string) => {
          // Perform sign-in logic here
          setSession(sessionToken);
          await fetchUser();
        },
        signOut,
        user,
        subscriptionEndDate,
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}