import { useNavigate } from 'react-router-dom';
import {
  AxiosProvider,
  createLocalStorageTokenStorage,
} from 'react-axios-provider-kit';

const tokenStorage = createLocalStorageTokenStorage('hr_access_token');

export function AppAxiosProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <AxiosProvider
      baseURL={import.meta.env.VITE_API_URL ?? 'https://localhost:7001'}
      tokenStorage={tokenStorage}
      onAuthFailure={() => {
        tokenStorage.set(undefined);
        navigate('/login', { replace: true });
      }}
      // No refreshAccessToken — keeps it simple, avoids loops
    >
      {children}
    </AxiosProvider>
  );
}
