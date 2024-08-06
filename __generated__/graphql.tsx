import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  error?: Maybe<FieldError>;
  sessionToken?: Maybe<Scalars['String']>;
};

export type AuthenticationUserResponse = {
  __typename?: 'AuthenticationUserResponse';
  error?: Maybe<FieldError>;
  subscriptionEndDate?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type Chat = {
  __typename?: 'Chat';
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  members?: Maybe<Array<User>>;
  messages?: Maybe<Array<Message>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type GeneralResponse = {
  __typename?: 'GeneralResponse';
  error?: Maybe<FieldError>;
  success?: Maybe<Scalars['Boolean']>;
};

export type Message = {
  __typename?: 'Message';
  chat?: Maybe<Chat>;
  content: Scalars['String'];
  createdAt: Scalars['DateTime'];
  deliveredTo?: Maybe<Array<User>>;
  id: Scalars['String'];
  seenBy?: Maybe<Array<User>>;
  sender: User;
  status?: Maybe<MessageStatus>;
};

/** status of the message */
export enum MessageStatus {
  Deleted = 'DELETED',
  Delivered = 'DELIVERED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Read = 'READ',
  Sent = 'SENT'
}

export type Mutation = {
  __typename?: 'Mutation';
  authenticate: AuthResponse;
  markAsDelivered: GeneralResponse;
  markAsRead: GeneralResponse;
  sendMessage: Message;
  sendPendingMessage: Message;
};


export type MutationAuthenticateArgs = {
  encryptedPrivateKey: Scalars['String'];
  expoPushToken: Scalars['String'];
  licenseKey: Scalars['String'];
  publicKey: Scalars['String'];
  username: Scalars['String'];
};


export type MutationMarkAsDeliveredArgs = {
  messageIds: Array<Scalars['String']>;
};


export type MutationMarkAsReadArgs = {
  messageIds: Array<Scalars['String']>;
};


export type MutationSendMessageArgs = {
  content: Scalars['String'];
  toUserId: Scalars['String'];
};


export type MutationSendPendingMessageArgs = {
  chatId: Scalars['String'];
  content: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  authenticatedUser?: Maybe<AuthenticationUserResponse>;
  chat?: Maybe<Chat>;
  chatResolverHealthCheck: Scalars['String'];
  chats: Array<Chat>;
  findAccount: AuthenticationUserResponse;
  getChatbyUserId?: Maybe<Chat>;
  userhealthCheck: Scalars['String'];
};


export type QueryChatArgs = {
  id: Scalars['String'];
};


export type QueryFindAccountArgs = {
  licenseKey: Scalars['String'];
};


export type QueryGetChatbyUserIdArgs = {
  id: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  newMessage: Message;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']>;
  encryptedPrivateKey?: Maybe<Scalars['String']>;
  expoPushToken?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  licenseKey?: Maybe<Scalars['String']>;
  profileUrl?: Maybe<Scalars['String']>;
  publicKey?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  username?: Maybe<Scalars['String']>;
};

export type FieldErrorFragmentFragment = { __typename?: 'FieldError', field: string, message: string };

export type ChatFragmentFragment = { __typename?: 'Chat', id: string, updatedAt?: any | null, createdAt?: any | null, members?: Array<{ __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null }> | null, messages?: Array<{ __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } }> | null };

export type MessageFragmentFragment = { __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } };

export type UserFragmentFragment = { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null };

export type AuthenticateMutationVariables = Exact<{
  licenseKey: Scalars['String'];
  username: Scalars['String'];
  publicKey: Scalars['String'];
  encryptedPrivateKey: Scalars['String'];
  expoPushToken: Scalars['String'];
}>;


export type AuthenticateMutation = { __typename?: 'Mutation', authenticate: { __typename?: 'AuthResponse', sessionToken?: string | null, error?: { __typename?: 'FieldError', field: string, message: string } | null } };

export type MarkAsDeliveredMutationVariables = Exact<{
  messageIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type MarkAsDeliveredMutation = { __typename?: 'Mutation', markAsDelivered: { __typename?: 'GeneralResponse', success?: boolean | null, error?: { __typename?: 'FieldError', field: string, message: string } | null } };

export type SendMessageMutationVariables = Exact<{
  toUserId: Scalars['String'];
  content: Scalars['String'];
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } } };

export type SendPendingMessageMutationVariables = Exact<{
  chatId: Scalars['String'];
  content: Scalars['String'];
}>;


export type SendPendingMessageMutation = { __typename?: 'Mutation', sendPendingMessage: { __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } } };

export type AuthenticatedUserQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthenticatedUserQuery = { __typename?: 'Query', authenticatedUser?: { __typename?: 'AuthenticationUserResponse', subscriptionEndDate?: any | null, user?: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } | null, error?: { __typename?: 'FieldError', field: string, message: string } | null } | null };

export type ChatQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type ChatQuery = { __typename?: 'Query', chat?: { __typename?: 'Chat', id: string, updatedAt?: any | null, createdAt?: any | null, members?: Array<{ __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null }> | null, messages?: Array<{ __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } }> | null } | null };

export type ChatsQueryVariables = Exact<{ [key: string]: never; }>;


export type ChatsQuery = { __typename?: 'Query', chats: Array<{ __typename?: 'Chat', id: string, updatedAt?: any | null, createdAt?: any | null, members?: Array<{ __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null }> | null, messages?: Array<{ __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } }> | null }> };

export type FindAccountQueryVariables = Exact<{
  licenseKey: Scalars['String'];
}>;


export type FindAccountQuery = { __typename?: 'Query', findAccount: { __typename?: 'AuthenticationUserResponse', error?: { __typename?: 'FieldError', field: string, message: string } | null, user?: { __typename?: 'User', id: string, username?: string | null, publicKey?: string | null, encryptedPrivateKey?: string | null } | null } };

export type GetChatbyUserIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetChatbyUserIdQuery = { __typename?: 'Query', getChatbyUserId?: { __typename?: 'Chat', id: string, updatedAt?: any | null, createdAt?: any | null, members?: Array<{ __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null }> | null, messages?: Array<{ __typename?: 'Message', id: string, content: string, createdAt: any, status?: MessageStatus | null, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null } }> | null } | null };

export type NewMessageSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NewMessageSubscription = { __typename?: 'Subscription', newMessage: { __typename?: 'Message', id: string, content: string, createdAt: any, sender: { __typename?: 'User', id: string, username?: string | null, profileUrl?: string | null, publicKey?: string | null }, chat?: { __typename?: 'Chat', id: string } | null } };

export const FieldErrorFragmentFragmentDoc = gql`
    fragment FieldErrorFragment on FieldError {
  field
  message
}
    `;
export const UserFragmentFragmentDoc = gql`
    fragment userFragment on User {
  id
  username
  profileUrl
  publicKey
}
    `;
export const MessageFragmentFragmentDoc = gql`
    fragment MessageFragment on Message {
  id
  content
  createdAt
  status
  sender {
    ...userFragment
  }
}
    ${UserFragmentFragmentDoc}`;
export const ChatFragmentFragmentDoc = gql`
    fragment ChatFragment on Chat {
  id
  updatedAt
  createdAt
  members {
    id
    username
    profileUrl
    publicKey
  }
  messages {
    ...MessageFragment
  }
}
    ${MessageFragmentFragmentDoc}`;
export const AuthenticateDocument = gql`
    mutation Authenticate($licenseKey: String!, $username: String!, $publicKey: String!, $encryptedPrivateKey: String!, $expoPushToken: String!) {
  authenticate(
    licenseKey: $licenseKey
    username: $username
    publicKey: $publicKey
    encryptedPrivateKey: $encryptedPrivateKey
    expoPushToken: $expoPushToken
  ) {
    error {
      ...FieldErrorFragment
    }
    sessionToken
  }
}
    ${FieldErrorFragmentFragmentDoc}`;

export function useAuthenticateMutation() {
  return Urql.useMutation<AuthenticateMutation, AuthenticateMutationVariables>(AuthenticateDocument);
};
export const MarkAsDeliveredDocument = gql`
    mutation MarkAsDelivered($messageIds: [String!]!) {
  markAsDelivered(messageIds: $messageIds) {
    error {
      ...FieldErrorFragment
    }
    success
  }
}
    ${FieldErrorFragmentFragmentDoc}`;

export function useMarkAsDeliveredMutation() {
  return Urql.useMutation<MarkAsDeliveredMutation, MarkAsDeliveredMutationVariables>(MarkAsDeliveredDocument);
};
export const SendMessageDocument = gql`
    mutation SendMessage($toUserId: String!, $content: String!) {
  sendMessage(toUserId: $toUserId, content: $content) {
    ...MessageFragment
  }
}
    ${MessageFragmentFragmentDoc}`;

export function useSendMessageMutation() {
  return Urql.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument);
};
export const SendPendingMessageDocument = gql`
    mutation SendPendingMessage($chatId: String!, $content: String!) {
  sendPendingMessage(chatId: $chatId, content: $content) {
    ...MessageFragment
  }
}
    ${MessageFragmentFragmentDoc}`;

export function useSendPendingMessageMutation() {
  return Urql.useMutation<SendPendingMessageMutation, SendPendingMessageMutationVariables>(SendPendingMessageDocument);
};
export const AuthenticatedUserDocument = gql`
    query AuthenticatedUser {
  authenticatedUser {
    user {
      ...userFragment
    }
    subscriptionEndDate
    error {
      ...FieldErrorFragment
    }
  }
}
    ${UserFragmentFragmentDoc}
${FieldErrorFragmentFragmentDoc}`;

export function useAuthenticatedUserQuery(options?: Omit<Urql.UseQueryArgs<AuthenticatedUserQueryVariables>, 'query'>) {
  return Urql.useQuery<AuthenticatedUserQuery, AuthenticatedUserQueryVariables>({ query: AuthenticatedUserDocument, ...options });
};
export const ChatDocument = gql`
    query chat($id: String!) {
  chat(id: $id) {
    ...ChatFragment
  }
}
    ${ChatFragmentFragmentDoc}`;

export function useChatQuery(options: Omit<Urql.UseQueryArgs<ChatQueryVariables>, 'query'>) {
  return Urql.useQuery<ChatQuery, ChatQueryVariables>({ query: ChatDocument, ...options });
};
export const ChatsDocument = gql`
    query Chats {
  chats {
    ...ChatFragment
  }
}
    ${ChatFragmentFragmentDoc}`;

export function useChatsQuery(options?: Omit<Urql.UseQueryArgs<ChatsQueryVariables>, 'query'>) {
  return Urql.useQuery<ChatsQuery, ChatsQueryVariables>({ query: ChatsDocument, ...options });
};
export const FindAccountDocument = gql`
    query FindAccount($licenseKey: String!) {
  findAccount(licenseKey: $licenseKey) {
    error {
      ...FieldErrorFragment
    }
    user {
      id
      username
      publicKey
      encryptedPrivateKey
    }
  }
}
    ${FieldErrorFragmentFragmentDoc}`;

export function useFindAccountQuery(options: Omit<Urql.UseQueryArgs<FindAccountQueryVariables>, 'query'>) {
  return Urql.useQuery<FindAccountQuery, FindAccountQueryVariables>({ query: FindAccountDocument, ...options });
};
export const GetChatbyUserIdDocument = gql`
    query GetChatbyUserId($id: String!) {
  getChatbyUserId(id: $id) {
    ...ChatFragment
  }
}
    ${ChatFragmentFragmentDoc}`;

export function useGetChatbyUserIdQuery(options: Omit<Urql.UseQueryArgs<GetChatbyUserIdQueryVariables>, 'query'>) {
  return Urql.useQuery<GetChatbyUserIdQuery, GetChatbyUserIdQueryVariables>({ query: GetChatbyUserIdDocument, ...options });
};
export const NewMessageDocument = gql`
    subscription NewMessage {
  newMessage {
    id
    content
    createdAt
    sender {
      ...userFragment
    }
    chat {
      id
    }
  }
}
    ${UserFragmentFragmentDoc}`;

export function useNewMessageSubscription<TData = NewMessageSubscription>(options: Omit<Urql.UseSubscriptionArgs<NewMessageSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<NewMessageSubscription, TData>) {
  return Urql.useSubscription<NewMessageSubscription, TData, NewMessageSubscriptionVariables>({ query: NewMessageDocument, ...options }, handler);
};