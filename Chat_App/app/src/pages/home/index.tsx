import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Mic, Users } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { UsernameModal, AlertModal } from '../../components/Modals';
import { LogicApiDataSource } from '../../api/dataSource/LogicApiDataSource';
import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
  getAppEndpointKey,
  getRefreshToken,
} from '@calimero-is-near/calimero-p2p-sdk';
import { clearApplicationId } from '../../utils/storage';

export default function IndexPage() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState('');
  const [username, setUsername] = useState('');
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showUsernameTakenAlert, setShowUsernameTakenAlert] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (identity) checkExistingUsername();
  }, [identity]);

  async function initAuth() {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      const identity = await client.getIdentity();
      setIdentity(identity.getPrincipal().toString());
    }
  }

  async function connectWallet() {
    try {
      await authClient?.login({
        identityProvider: 'https://beta.identity.ic0.app/',
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          setIdentity(identity.getPrincipal().toString());
        },
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  }

  async function checkExistingUsername() {
    const result = await new LogicApiDataSource().getUsername({
        wallet_address: identity
    });

    if (result.data) {
        setUsername(result.data);
        setShowUsernameModal(false);
    } else {
        setShowUsernameModal(true);
    }
}

async function handleUsernameSubmit(newUsername: string) {
  const result = await new LogicApiDataSource().registerUser({
    username: newUsername,
    wallet_address: identity
  });

  console.log(newUsername)

  console.log(result.data)

  if (!result.data) {
    setShowUsernameTakenAlert(true);
    return;
  }

  setUsername(newUsername);
  setShowUsernameModal(false);
}

  const navigateToRoom = (type: 'chat' | 'voice') => {
    navigate(`/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="space-background">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      </div>

      <Navbar
        identity={identity}
        connectWallet={connectWallet}
        disconnectWallet={async () => {
          await authClient?.logout();
          setIdentity('');
          setUsername('');
        }}
        logout={() => {
          clearAppEndpoint();
          clearJWT();
          clearApplicationId();
          setIdentity('');
          setUsername('');
          navigate('/auth');
        }}
      />

      <div className="container mx-auto px-4 pt-20">
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          {!identity ? (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white mb-8">
                Welcome to ChatApp
              </h1>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white px-8 py-4 rounded-xl"
              >
                <Users className="inline-block w-5 h-5 mr-2" />
                Connect Internet Identity
              </button>
            </div>
          ) : username ? (
            <div className="w-full max-w-4xl grid grid-cols-2 gap-8">
              <div className="border-r border-gray-700 pr-8">
                <button
                  onClick={() => navigateToRoom('voice')}
                  className="w-full p-8 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition"
                >
                  <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-bold text-white">Voice Rooms (In development)</h2>
                </button>
              </div>
              <div className="pl-8">
                <button
                  onClick={() => navigateToRoom('chat')}
                  className="w-full p-8 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition"
                >
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-bold text-white">Chat Rooms</h2>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <UsernameModal
        isOpen={showUsernameModal}
        onSubmit={handleUsernameSubmit}
      />
       <AlertModal
        isOpen={showUsernameTakenAlert}
        onClose={() => setShowUsernameTakenAlert(false)}
        title="Username Already Taken"
        message="This username is already registered. Please choose a different username."
        type="error"
      />
    </div>
  );
}