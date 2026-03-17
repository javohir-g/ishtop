import { useState, useCallback } from 'react';
import api from '../services/api';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(apiFunc: (...args: any[]) => Promise<any>) {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await apiFunc(...args);
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Something went wrong';
      setState({ data: null, loading: false, error: errorMsg });
      throw err;
    }
  }, [apiFunc]);

  return { ...state, execute };
}

export function useApiMutation<T>(apiFunc: (...args: any[]) => Promise<any>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Something went wrong';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, [apiFunc]);

  return { mutate, loading, error };
}
