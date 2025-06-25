import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface StateSnapshot {
  timestamp: number;
  userId: string;
  route: string;
  formData: Record<string, any>;
  courseCreationState?: {
    isOpen: boolean;
    formData: any;
    selectedTeachers: string[];
    activeNavItem: string;
  };
  userPreferences: Record<string, any>;
  sessionData: Record<string, any>;
}

const STATE_STORAGE_KEY = 'eduease_app_state';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds
const MAX_STATE_AGE = 24 * 60 * 60 * 1000; // 24 hours

export function useStateRecovery() {
  const { user } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [hasRecoverableState, setHasRecoverableState] = useState(false);

  // Save current state to localStorage
  const saveState = useCallback((stateData: Partial<StateSnapshot>) => {
    if (!user?.id) return;

    try {
      const currentState: StateSnapshot = {
        timestamp: Date.now(),
        userId: user.id,
        route: window.location.pathname,
        formData: {},
        userPreferences: {},
        sessionData: {},
        ...stateData
      };

      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(currentState));
      console.log('State saved:', currentState);
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [user?.id]);

  // Load state from localStorage
  const loadState = useCallback((): StateSnapshot | null => {
    try {
      const savedState = localStorage.getItem(STATE_STORAGE_KEY);
      if (!savedState) return null;

      const state: StateSnapshot = JSON.parse(savedState);
      
      // Check if state is too old
      if (Date.now() - state.timestamp > MAX_STATE_AGE) {
        localStorage.removeItem(STATE_STORAGE_KEY);
        return null;
      }

      // Check if state belongs to current user
      if (user?.id && state.userId !== user.id) {
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to load state:', error);
      localStorage.removeItem(STATE_STORAGE_KEY);
      return null;
    }
  }, [user?.id]);

  // Recover application state
  const recoverState = useCallback(async () => {
    const savedState = loadState();
    if (!savedState) return null;

    setIsRecovering(true);
    
    try {
      console.log('Recovering state:', savedState);
      
      // Navigate to saved route if different from current
      if (savedState.route !== window.location.pathname) {
        window.history.pushState({}, '', savedState.route);
      }

      return savedState;
    } catch (error) {
      console.error('Failed to recover state:', error);
      return null;
    } finally {
      setIsRecovering(false);
    }
  }, [loadState]);

  // Clear saved state
  const clearState = useCallback(() => {
    localStorage.removeItem(STATE_STORAGE_KEY);
    setHasRecoverableState(false);
  }, []);

  // Check for recoverable state on mount
  useEffect(() => {
    if (user?.id) {
      const savedState = loadState();
      setHasRecoverableState(!!savedState);
    }
  }, [user?.id, loadState]);

  // Auto-save state periodically
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      // Auto-save basic session data
      saveState({
        sessionData: {
          lastActivity: Date.now(),
          currentPage: window.location.pathname
        }
      });
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [user?.id, saveState]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState({
        sessionData: {
          lastActivity: Date.now(),
          currentPage: window.location.pathname,
          unexpectedExit: true
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState]);

  return {
    saveState,
    loadState,
    recoverState,
    clearState,
    isRecovering,
    hasRecoverableState
  };
}