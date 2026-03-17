import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'success',
  showToast: (message, type = 'success') => {
    set({ message, type });
    setTimeout(() => {
      set({ message: null });
    }, 3000);
  },
  hideToast: () => set({ message: null }),
}));
