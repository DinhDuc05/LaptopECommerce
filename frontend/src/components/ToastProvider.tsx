'use client';

/**
 * ToastProvider – Bọc <Toaster /> của react-hot-toast vào một Client Component
 * riêng biệt để layout.tsx (Server Component) có thể import mà không bị lỗi.
 */
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: '13px',
          fontWeight: '600',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
          },
          iconTheme: { primary: '#16a34a', secondary: '#fff' },
        },
        error: {
          style: {
            background: '#fff1f2',
            color: '#be123c',
            border: '1px solid #fecdd3',
          },
          iconTheme: { primary: '#e11d48', secondary: '#fff' },
        },
      }}
    />
  );
}

