// context/ConnectionContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface ConnectionContextProps {
  isConnected: boolean;
}

const ConnectionContext = createContext<ConnectionContextProps | undefined>(undefined);

export const ConnectionProvider = (props: React.PropsWithChildren) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isConnected }}>
      {props.children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextProps => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};