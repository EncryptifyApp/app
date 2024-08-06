//ENVIRONMENT
export const isProduction = process.env.NODE_ENV === 'production';

//TODO: add server ip here
//SERVER
export const SERVER = '192.168.11.107:4000';

//URLS
export const httpUrl = `http://${SERVER}/graphql`;
export const wsUrl = `ws://${SERVER}/graphql`;