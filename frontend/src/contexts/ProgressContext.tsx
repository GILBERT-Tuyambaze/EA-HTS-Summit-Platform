import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import ProgressModal from '../components/ProgressModal';

export type ProgressStepStatus = 'pending' | 'active' | 'complete' | 'error';
export type ProgressStep = {
  label: string;
  status: ProgressStepStatus;
  subtitle?: string;
};

export type ProgressState = {
  open: boolean;
  title: string;
  description: string;
  progress: number;
  steps: ProgressStep[];
};

type ProgressRequest = Omit<ProgressState, 'open' | 'progress'> & {
  progress?: number;
};

type ProgressContextValue = {
  openProgress: (request: ProgressRequest) => void;
  updateProgress: (update: Partial<ProgressRequest>) => void;
  closeProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

function computeProgressFromSteps(steps: ProgressStep[]) {
  if (steps.length === 0) return 0;
  const completed = steps.filter((step) => step.status === 'complete').length;
  const active = steps.filter((step) => step.status === 'active').length;
  return Math.min(100, Math.round(((completed + active) / steps.length) * 100));
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>({
    open: false,
    title: '',
    description: '',
    progress: 0,
    steps: [],
  });

  const openProgress = useCallback((request: ProgressRequest) => {
    const progress = request.progress ?? computeProgressFromSteps(request.steps);
    setState({ open: true, title: request.title, description: request.description, progress, steps: request.steps });
  }, []);

  const updateProgress = useCallback((update: Partial<ProgressRequest>) => {
    setState((current) => {
      if (!current.open) return current;
      const steps = update.steps ?? current.steps;
      const progress = update.progress ?? computeProgressFromSteps(steps);
      return {
        ...current,
        ...update,
        progress,
        steps,
      };
    });
  }, []);

  const closeProgress = useCallback(() => {
    setState((current) => ({
      open: false,
      title: current.title,
      description: current.description,
      progress: 0,
      steps: [],
    }));
  }, []);

  const value = useMemo(() => ({ openProgress, updateProgress, closeProgress }), [openProgress, updateProgress, closeProgress]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
      {state.open ? (
        <ProgressModal
          title={state.title}
          description={state.description}
          progress={state.progress}
          steps={state.steps}
          onClose={closeProgress}
        />
      ) : null}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
}
