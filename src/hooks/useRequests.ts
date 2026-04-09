import { useState, useEffect, useCallback } from 'react';
import { requestsApi, RequestThread, ThreadDetail } from '../api/requests';

export function useRequests(firmId: string | null) {
  const [threads, setThreads] = useState<RequestThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!firmId) return;
    setLoading(true);
    requestsApi.list(firmId)
      .then(({ requests }) => { setThreads(requests); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [firmId]);

  useEffect(() => { refresh(); }, [refresh]);

  const createThread = useCallback(async (data: { subject: string; requestType?: string; caseId?: string; body: string }) => {
    if (!firmId) throw new Error('No firm');
    const { request } = await requestsApi.create(firmId, data);
    setThreads(prev => [request, ...prev]);
    return request;
  }, [firmId]);

  return { threads, loading, error, refresh, createThread };
}

export function useThread(firmId: string | null, requestId: string | null) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!firmId || !requestId) return;
    setLoading(true);
    requestsApi.get(firmId, requestId)
      .then(({ request }) => { setThread(request); setLoading(false); })
      .catch(() => setLoading(false));
  }, [firmId, requestId]);

  useEffect(() => { refresh(); }, [refresh]);

  const postMessage = useCallback(async (body: string) => {
    if (!firmId || !requestId) return;
    await requestsApi.postMessage(firmId, requestId, { body });
    refresh();
  }, [firmId, requestId, refresh]);

  return { thread, loading, refresh, postMessage };
}
