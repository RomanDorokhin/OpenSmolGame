import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let toastListeners: Array<(msg: string) => void> = [];

export function showToast(message: string) {
  toastListeners.forEach((fn) => fn(message));
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const listener = (msg: string) => {
      setMessage(msg);
      setVisible(true);
      if (timeoutId) clearTimeout(timeoutId);
      const id = setTimeout(() => setVisible(false), 2000);
      setTimeoutId(id);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 left-1/2 z-[100] px-5 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap pointer-events-none"
          style={{
            background: '#06d6a0',
            color: '#0f2e27',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
