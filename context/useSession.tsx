import React, { useEffect, useState } from 'react';
import { useStorageState } from '../utils/useStorageState';
import { User, useUserQuery } from '../generated/graphql';


const AuthContext = React.createContext<{
  authenticateUser: (sessionToken: string) => void;
  signOut: () => void;
  user: User | null;
  session?: string | null;
  isLoading: boolean;
} | null>({
  authenticateUser: async () => { },
  signOut: async () => { },
  user: null,
  session: null,
  isLoading: false,
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
  const [result, reexecuteQuery] = useUserQuery();

  const { data, fetching } = result;

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
    if (fetching == false && !data?.user) {
      console.log("session expired",session);
      console.log("no user found");
      setUser(null);
      }
   
  }, [data, fetching])

  return (
    <AuthContext.Provider
      value={{
        authenticateUser: (sessionToken: string) => {
          // Perform sign-in logic here
          setSession(sessionToken);
          reexecuteQuery();
        },
        signOut: () => {
          setSession(null);
        },
        user,
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
