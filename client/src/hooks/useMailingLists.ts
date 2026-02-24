import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMailingLists, createMailingList, deleteMailingList, updateMailingList } from '../services/api';
import type { MailingListData } from '../services/api';

export type { MailingListData as MailingList } from '../services/api';

export const useMailingLists = () => {
  const [lists, setLists] = useState<MailingListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMailingLists();
      setLists(data);
    } catch (err: any) {
      // If no lists found (404), set empty array instead of error
      if (err?.response?.status === 404) {
        setLists([]);
      } else {
        setError('Failed to load mailing lists');
        console.error('Failed to fetch mailing lists:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const addList = useCallback(async (name: string, emails: string[], description?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || emails.length === 0) return;

    try {
      const newList = await createMailingList({
        name: trimmedName,
        description: description || '',
        emails,
      });
      setLists((prev) => [newList, ...prev]);
    } catch (err) {
      console.error('Failed to create mailing list:', err);
      setError('Failed to create mailing list');
    }
  }, []);

  const removeList = useCallback(async (id: string) => {
    try {
      await deleteMailingList(id);
      setLists((prev) => prev.filter((list) => list.id !== id));
    } catch (err) {
      console.error('Failed to delete mailing list:', err);
      setError('Failed to delete mailing list');
    }
  }, []);

  const updateList = useCallback(async (id: string, name: string, emails: string[], description?: string) => {
    try {
      const updated = await updateMailingList(id, {
        name: name.trim() || undefined,
        emails,
        description,
      });
      setLists((prev) =>
        prev.map((list) => (list.id === id ? updated : list))
      );
    } catch (err) {
      console.error('Failed to update mailing list:', err);
      setError('Failed to update mailing list');
    }
  }, []);

  const getListById = useCallback(
    (id: string) => lists.find((list) => list.id === id) || null,
    [lists],
  );

  const listOptions = useMemo(
    () => lists.map((list) => ({ value: list.id, label: list.name })),
    [lists],
  );

  return {
    lists,
    listOptions,
    loading,
    error,
    addList,
    removeList,
    updateList,
    getListById,
    reloadLists: loadLists,
  };
};
