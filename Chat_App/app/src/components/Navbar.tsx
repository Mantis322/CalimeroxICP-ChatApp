import { MessageSquare, LogOut, Wallet, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBalance } from './useBalance';

interface NavbarProps {
  identity: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
  logout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  identity,
  connectWallet,
  disconnectWallet,
  logout
}) => {
  const navigate = useNavigate();
  const balance = useBalance(identity);
  const [copied, setCopied] = useState(false);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (!identity) return;
    try {
      await navigator.clipboard.writeText(identity);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2 saniye sonra reset
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <MessageSquare className="w-6 h-6 text-zinc-400" />
            <span className="text-xl font-bold text-zinc-200">ChatApp</span>
          </button>
          {identity && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {balance} ICP
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-sm flex items-center gap-2 hover:bg-zinc-700/80 transition-colors"
              >
                {shortenAddress(identity)}
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={disconnectWallet}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};