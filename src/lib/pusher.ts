import Pusher from 'pusher-js';

// Initialize Pusher with your app credentials
// Replace these with your actual Pusher credentials
const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'your-app-key', {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  forceTLS: true,
});

export default pusherClient;