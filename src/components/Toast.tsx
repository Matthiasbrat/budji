import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToastStore } from '../store/useToastStore';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const ToastContainer = () => {
  const { message, type, hideToast } = useToastStore();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
        >
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md",
            type === 'success' && "bg-white/90 border-green-200 text-green-800",
            type === 'error' && "bg-white/90 border-red-200 text-red-800",
            type === 'info' && "bg-white/90 border-blue-200 text-blue-800"
          )}>
            {type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <span className="font-medium text-sm">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
