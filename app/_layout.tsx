import React, { useEffect, useState } from 'react';
import { Provider, createClient, fetchExchange, cacheExchange, subscriptionExchange } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';
import { Slot } from 'expo-router';
import { useStorageState } from '../utils/useStorageState';
import { httpUrl, wsUrl } from '../config';
import NetInfo from '@react-native-community/netinfo';
import { Provider as PaperProvider } from 'react-native-paper';
import { SessionProvider } from '../context/useSession';
const Root = () => {
  const [[, session]] = useStorageState('session');
  const [isConnected, setIsConnected] = useState(false);
  const [wsClient, setWsClient] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected!);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let client: any;

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
          if (client) {
            client.terminate();
            setWsClient(null);
          }
        },
      },
    });

    const initWebSocketClient = () => {
      if (session && isConnected) {
        client = createWebSocketClient(session);
        setWsClient(client);
      } else {
        setWsClient(null);
      }
    };

    initWebSocketClient();

    return () => {
      if (client) {
        client.terminate();
        setWsClient(null);
      }
    };
  }, [session, isConnected]);

  useEffect(() => {
    const handleReconnect = () => {
      if (session && isConnected && !wsClient) {
        const client = createWSClient({
          url: wsUrl,
          connectionParams: {
            authorization: session ? `${session}` : null,
          },
          on: {
            connected: () => {
              console.log('Handling reconnect: WebSocket connected');
            },
            error: (err) => {
              if (client) {
                client.terminate();
                setWsClient(null);
              }
            },
          },
        });
        setWsClient(client);
      }
    };

    handleReconnect();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        handleReconnect();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [session, isConnected]);

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
          if (!wsClient) {
            return {
              subscribe: (sink) => {
                sink.error(new Error('WebSocket client not initialized'));
                return { unsubscribe: () => { } };
              },
            };
          }

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
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </SessionProvider>
    </Provider>
  );
};

export default Root;
