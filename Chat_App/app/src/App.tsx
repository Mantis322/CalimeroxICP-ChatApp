import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './pages/home';
import SetupPage from './pages/setup';
import ChatPage from './pages/chat';
import VoicePage from './pages/voice';
import Authenticate from './pages/login/Authenticate';
import { AccessTokenWrapper } from '@calimero-network/calimero-client';
import { getNodeUrl } from './utils/node';

export default function App() {
  return (
    <AccessTokenWrapper getNodeUrl={getNodeUrl}>
      <BrowserRouter basename="/core-app-template/">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/auth" element={<Authenticate />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/voice" element={<VoicePage />} />
        </Routes>
      </BrowserRouter>
    </AccessTokenWrapper>
  );
}
