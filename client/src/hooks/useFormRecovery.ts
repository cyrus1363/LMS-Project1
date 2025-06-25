import { useEffect, useCallback, useRef } from 'react';
import { useStateRecovery } from './useStateRecovery';

interface FormRecoveryOptions {
  formId: string;
  autoSave?: boolean;
  saveInterval?: number;
}

export function useFormRecovery({ 
  formId, 
  autoSave = true, 
  saveInterval = 3000 
}: FormRecoveryOptions) {
  const { saveState, loadState } = useStateRecovery();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Save form data with debouncing
  const saveFormData = useCallback((formData: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveState({
        formData: {
          [formId]: {
            ...formData,
            savedAt: Date.now()
          }
        }
      });
    }, 1000); // Debounce for 1 second
  }, [formId, saveState]);

  // Load saved form data
  const loadFormData = useCallback(() => {
    const state = loadState();
    return state?.formData?.[formId] || null;
  }, [formId, loadState]);

  // Clear form data from storage
  const clearFormData = useCallback(() => {
    saveState({
      formData: {
        [formId]: null
      }
    });
  }, [formId, saveState]);

  // Auto-save setup
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      // This will be triggered by form components that use this hook
    }, saveInterval);

    return () => {
      clearInterval(interval);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [autoSave, saveInterval]);

  return {
    saveFormData,
    loadFormData,
    clearFormData
  };
}