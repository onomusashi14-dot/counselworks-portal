import { useState, useEffect } from 'react';
import { casesApi, Case, ActivityEntry } from '../api/cases';

export function useCases(firmId: string | null) {
  const [cases, setCases]   = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!firmId) return;
    setLoading(true);
    casesApi.list(firmId)
      .then(({ cases }) => { setCases(cases); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [firmId]);

  return { cases, loading, error };
}

export function useCase(firmId: string | null, caseId: string | null) {
  const [caseRecord, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!firmId || !caseId) return;
    setLoading(true);
    casesApi.get(firmId, caseId)
      .then(({ case: c }) => { setCase(c); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [firmId, caseId]);

  return { caseRecord, loading, error };
}

export function useCaseActivity(firmId: string | null, caseId: string | null) {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!firmId || !caseId) return;
    setLoading(true);
    casesApi.activity(firmId, caseId)
      .then(({ activity }) => { setActivity(activity); setLoading(false); })
      .catch(() => setLoading(false));
  }, [firmId, caseId]);

  return { activity, loading };
}
