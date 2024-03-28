import React, { useEffect } from 'react';
import { Provider, createClient, fetchExchange, cacheExchange, subscriptionExchange } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';
import { Slot } from 'expo-router';
import { SessionProvider } from '../context/useSession';
import { useStorageState } from '../utils/useStorageState';
import { httpUrl, wsUrl } from '../config';
import { ChatProvider } from '../context/useChat';

const Root = () => {
  const [[, session]] = useStorageState('session');

  // Create WebSocket client
  let wsClient: any;

  useEffect(() => {
    const createWebSocketClient = (session: string) => createWSClient({
      url: wsUrl,
      connectionParams: {
        authorization: session ? `${session}` : null,
      },
      on: {
        connected: () => {
          console.log('WebSocket connected');
        },
        error: (err) => {
          console.error('WebSocket error', err);
        },
      },
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
        <ChatProvider>
          <Slot />
        </ChatProvider>
      </SessionProvider>
    </Provider>
  );
};

export default Root;