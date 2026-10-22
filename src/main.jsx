import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UiProvider } from '@/common/components';
import { QueryClientProvider, queryClient } from '@/adapters/query';
import { NotificationHost } from '@/adapters/notifications';
import { AuthProvider } from '@/application';
import App from '@/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UiProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
      <NotificationHost />
    </UiProvider>
  </StrictMode>
);
