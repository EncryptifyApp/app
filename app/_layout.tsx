import React, { useEffect } from 'react';
import { Provider, createRequest, createClient, fetchExchange, cacheExchange, subscriptionExchange } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';
import { Slot } from 'expo-router';
import { SessionProvider } from '../context/useSession';
import { Toasts } from '@backpackapp-io/react-native-toast';
import { useStorageState } from '../utils/useStorageState';

const httpUrl = 'http://192.168.0.109:4000/graphql';
const wsUrl = 'ws://192.168.0.109:4000/graphql';

const Root = () => {
  const [[, session], setSession] = useStorageState('session');

  // Create WebSocket client
  let wsClient: any;

  useEffect(() => {
    const createWebSocketClient = (session: string) => createWSClient({
      url: wsUrl,
      connectionParams: {
        authorization: session ? `${session}` : null,
      },
      on: {connected: () => {
        console.log('WebSocket connected');
      },
      error: (err) => {
        console.log('WebSocket error', err);
      },},
    });

    const initWebSocketClient = async () => {
      if (session) {
        wsClient = createWebSocketClient(session);
      }
    };

    initWebSocketClient();

    return () => {
      if (wsClient) {
        wsClient.terminate();
        wsClient = null;
      }
    };
  }, [session]);

  // Create HTTP client
  const client = createClient({
    url: httpUrl,
    fetchOptions: () => {
      return session ? { headers: { Authorization: `${session}` } } : {};
  },
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(request) {
        const input = { ...request, query: request.query || '' };
        return {
          subscribe(sink) {
            const unsubscribe = wsClient.subscribe(input, sink);
            return { unsubscribe };
          },
        };
      },
    }),
  ],
  });

  return (
    <Provider value={client}>
      <SessionProvider>
        <Slot />
      </SessionProvider>
      <Toasts />
    </Provider>
  );
};

export default Root;
