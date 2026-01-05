// client/src/hooks/useEmails.ts
import { useState, useEffect, useCallback } from 'react';
import type { Email, Conversation } from '../types/interfaces';
import { fetchEmails } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../context/AuthContext';

interface EmailState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
}

const useEmails = () => {
  const { isAuthenticated, accessToken } = useAuth();
  const [emailState, setEmailState] = useState<EmailState>({
    conversations: [],
    loading: true,
    error: null,
  });

  const groupEmailsIntoConversations = useCallback((emails: Email[]): Conversation[] => {
    const conversationsMap = new Map<string, Conversation>();

    emails.forEach(email => {
      const convId = email.conversation_id || email.id; // Use email.id if no conversation_id

      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          id: convId,
          user_id: email.user_id, // Assuming all emails in a conversation belong to the same user
          subject: email.subject,
          participants: [], // Will populate later if needed
          last_message_at: email.created_at,
          message_count: 0,
          created_at: email.created_at,
          emails: [],
        });
      }

      const conversation = conversationsMap.get(convId)!;
      conversation.emails.push(email);
      conversation.message_count++;

      // Update last_message_at if the current email is newer
      if (new Date(email.created_at) > new Date(conversation.last_message_at)) {
        conversation.last_message_at = email.created_at;
      }
    });

    // Sort emails within each conversation by created_at (oldest first for reading)
    conversationsMap.forEach(conv => {
      conv.emails.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      // For simplicity, participants are not explicitly parsed/populated here,
      // but in a real app, you'd extract them from recipients across all emails.
    });

    // Sort conversations by last_message_at (newest first for display in inbox)
    return Array.from(conversationsMap.values()).sort((a, b) =>
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
  }, []);

  const loadEmails = useCallback(async () => {
    if (!isAuthenticated) {
      setEmailState({ conversations: [], loading: false, error: null });
      return;
    }

    setEmailState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const fetchedEmails = await fetchEmails();
      const conversations = groupEmailsIntoConversations(fetchedEmails);
      setEmailState({ conversations, loading: false, error: null });
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setEmailState({ conversations: [], loading: false, error: 'Failed to load emails.' });
    }
  }, [isAuthenticated, groupEmailsIntoConversations]);

  useEffect(() => {
    const initLoad = async () => {
      await loadEmails();
    };
    initLoad();
  }, [loadEmails]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketService.connect(accessToken);

      const handleNewEmail = (newEmail: Email) => {
        console.log('New email received via WebSocket:', newEmail);
        setEmailState((prev) => {
          const allEmails = [...prev.conversations.flatMap(c => c.emails), newEmail];
          const updatedConversations = groupEmailsIntoConversations(allEmails);
          return { ...prev, conversations: updatedConversations };
        });
      };

      socketService.on('newEmail', handleNewEmail);

      return () => {
        socketService.off('newEmail', handleNewEmail);
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, accessToken, groupEmailsIntoConversations]);


  return { ...emailState, reloadEmails: loadEmails };
};

export default useEmails;
