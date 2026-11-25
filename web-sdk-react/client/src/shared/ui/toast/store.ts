import { create } from 'zustand';

type ToastTone = 'info' | 'error';

interface Toast {
  id: number;
  messageKey: string;
  params: Record<string, string>;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
}

const VISIBLE_MS = 4000;

let nextId = 0;

export const useToastStore = create<ToastState>(() => ({ toasts: [] }));

export const showToast = (messageKey: string, options: { params?: Record<string, string>; tone?: ToastTone } = {}) => {
  const id = nextId++;

  useToastStore.setState(({ toasts }) => ({
    toasts: [...toasts, { id, messageKey, params: options.params ?? {}, tone: options.tone ?? 'info' }],
  }));

  setTimeout(() => {
    useToastStore.setState(({ toasts }) => ({ toasts: toasts.filter((toast) => toast.id !== id) }));
  }, VISIBLE_MS);
};
