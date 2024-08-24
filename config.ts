//ENVIRONMENT
export const isProduction = process.env.NODE_ENV === 'production';

//SERVER
export const SERVER = isProduction ? "3.76.98.4" : "192.168.11.111:4000"

//URLS
export const httpUrl = `http://${SERVER}/graphql`;
export const wsUrl = `ws://${SERVER}/graphql`;