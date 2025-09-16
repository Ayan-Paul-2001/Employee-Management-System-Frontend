import { useState, useEffect } from 'react';
import pusherClient from '@/lib/pusher';

type PusherEvent = {
  type: string;
  message: string;
  data?: any;
};

type UsePusherOptions = {
  channelName: string;
  eventName: string;
  onEvent?: (data: any) => void;
};

export function usePusher({ channelName, eventName, onEvent }: UsePusherOptions) {
  const [events, setEvents] = useState<PusherEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to the channel
    const channel = pusherClient.subscribe(channelName);
    setIsConnected(true);

    // Bind to the event
    channel.bind(eventName, (data: any) => {
      const newEvent: PusherEvent = {
        type: eventName,
        message: data.message || 'New event received',
        data,
      };

      setEvents((prevEvents) => [newEvent, ...prevEvents]);

      // Call the callback if provided
      if (onEvent) {
        onEvent(data);
      }
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [channelName, eventName, onEvent]);

  return { events, isConnected };
}