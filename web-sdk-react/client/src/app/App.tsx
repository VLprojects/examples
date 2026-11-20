import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { HomePage } from '@/pages/home';
import { RoomPage } from '@/pages/room';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/r/:alias" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
