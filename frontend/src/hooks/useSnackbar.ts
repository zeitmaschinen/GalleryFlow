import { useState, useCallback } from 'react';
import { config } from '../config';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarMessage {
  id: number;
  message: string;
  severity: Severity;
}

export const useSnackbar = () => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const [messageId, setMessageId] = useState(0);

  const showSnackbar = useCallback((message: string, severity: Severity = 'success') => {
    const id = messageId;
    setMessageId(prev => prev + 1);
    
    setMessages(prev => [...prev, { id, message, severity }]);

    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, config.ui.snackbarDuration);
  }, [messageId]);

  const closeSnackbar = useCallback((id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  return {
    messages,
    showSnackbar,
    closeSnackbar
  };
};