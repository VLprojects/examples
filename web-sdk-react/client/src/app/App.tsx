import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { RoomPage } from '@/pages/room';
import { Toaster } from '@/shared/ui';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomPage />} />
        <Route path="/r/:alias" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
