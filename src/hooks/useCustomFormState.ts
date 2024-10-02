// src/hooks/useCustomFormState.ts
import { useState } from 'react';

export function useCustomFormState(action: Function, initialState: any) {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const dispatch = async (formData: FormData) => {
    setIsPending(true);
    try {
      const result = await action(null, formData);
      setState(result);
    } finally {
      setIsPending(false);
    }
  };

  return [state, dispatch, isPending] as const;
}

export function useCustomFormStatus() {
  return { pending: false };  // Por ahora, siempre retornamos false
}