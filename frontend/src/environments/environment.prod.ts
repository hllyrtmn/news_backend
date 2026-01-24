// Production environment
export const environment = {
  production: true,
  apiUrl: 'https://localhost:8000/api/v1',
  wsUrl: 'wss://localhost:8000/ws',

  // Social OAuth
  googleClientId: '678186651494-fre1frg26kba2eau0kpd0su6clli57tv.apps.googleusercontent.com',
  facebookAppId: 'YOUR_FACEBOOK_APP_ID',

  // App settings
  appName: 'Haber Sitesi',
  itemsPerPage: 20,
  cacheTimeout: 300000, // 5 minutes in ms

  // WebSocket settings
  wsReconnectInterval: 5000, // 5 seconds
  wsMaxRetries: 10,
};
