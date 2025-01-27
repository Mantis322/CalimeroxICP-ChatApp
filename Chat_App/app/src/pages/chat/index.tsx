import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Send, Trash2, ArrowLeft, Search } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { RoomType } from '../../api/clientApi';
import { UsernameModal, PasswordModal, AlertModal } from '../../components/Modals';
import { SubscriptionsClient } from '@calimero-network/calimero-client';
import { getWsSubscriptionsClient, LogicApiDataSource } from '../../api/dataSource/LogicApiDataSource';
import { getContextId } from '../../utils/node';
import { AuthClient } from '@dfinity/auth-client';
import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
  getAppEndpointKey,
  getRefreshToken,
} from '@calimero-network/calimero-client';
import { clearApplicationId } from '../../utils/storage';
import { getStorageApplicationId } from '../../utils/node';


export default function ChatPage() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState('');
  const [username, setUsername] = useState('');
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [currentRoom, setCurrentRoom] = useState('');
  const [messages, setMessages] = useState<[string, string, number][]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showRoomExistsAlert, setShowRoomExistsAlert] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [roomCreator, setRoomCreator] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const url = getAppEndpointKey();
      const applicationId = getStorageApplicationId();
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!url || !applicationId || !accessToken || !refreshToken) {
        navigate('/auth');
        return;
      }

      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        const identity = await client.getIdentity();
        setIdentity(identity.getPrincipal().toString());
      } else {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (identity) {
      checkExistingUsername();
    }
  }, [identity]);

  useEffect(() => {
  const observeNodeEvents = async () => {
    let subscriptionsClient: SubscriptionsClient = getWsSubscriptionsClient();
    await subscriptionsClient.connect();
    subscriptionsClient.subscribe([getContextId()]);

    subscriptionsClient?.addCallback(async () => {
      if (currentRoom) {
        await loadMessages(currentRoom);
      }
    });

    return () => {
      subscriptionsClient?.disconnect();
    };
  };

  observeNodeEvents();
}, [currentRoom]);

useEffect(() => {
  const messagesContainer = document.querySelector('.overflow-y-auto');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}, [messages]);

  useEffect(() => {
    if (username) {
      loadRooms();
    }
  }, [username]);

  async function checkExistingUsername() {
    const result = await new LogicApiDataSource().getUsername({
      wallet_address: identity
    });

    if (result.data) {
      setUsername(result.data);
    } else {
      navigate('/home');
    }
  }

  const disconnectWallet = async () => {
    if (authClient) {
      await authClient.logout();
      setIdentity('');
      setUsername('');
      navigate('/home');
    }
  };

  const logout = () => {
    clearAppEndpoint();
    clearJWT();
    clearApplicationId();
    setIdentity('');
    setUsername('');
    navigate('/auth');
  };

  const handleJoinRoom = (roomName: string) => {
    setSelectedRoom(roomName);
    setShowPasswordModal(true);
  };

  async function loadRooms() {
    const result = await new LogicApiDataSource().listRooms();
    if (result?.error) {
      console.error('Error:', result.error);
      return;
    }
   
    const chatRooms = await Promise.all(
      (result.data ?? []).map(async (roomName) => {
        const roomInfo = await new LogicApiDataSource().getRoomInfo({
          room_name: roomName
        });
        if (roomInfo?.data && Array.isArray(roomInfo.data)) {
          return {
            name: roomName,
            type: roomInfo.data[1]
          };
        }
        return null;
      })
    );
   
    setAvailableRooms(
      chatRooms
        .filter(room => room && room.type === RoomType.Chat)
        .map(room => room!.name)
    );
   }


   
  async function createRoom() {
    if (!newRoomName || !newRoomPassword) return;

    const rooms = await new LogicApiDataSource().listRooms();
    if (rooms.data?.includes(newRoomName)) {
      setShowRoomExistsAlert(true);
      return;
    }

    const result = await new LogicApiDataSource().createRoom({
      name: newRoomName,
      password: newRoomPassword,
      creator: identity,
      room_type: RoomType.Chat
    });

    if (result?.error) {
      console.error('Error:', result.error);
      return;
    }

    setNewRoomName('');
    setNewRoomPassword('');
    await loadRooms();
  }

  async function loadRoomInfo(roomName: string) {
    const result = await new LogicApiDataSource().getRoomInfo({
      room_name: roomName
    });

    if (result?.data && Array.isArray(result.data)) {
      setRoomCreator(result.data[2]);
    }
  }

  async function joinRoom(roomName: string, password: string) {
    try {
      const result = await new LogicApiDataSource().joinRoom({
        room_name: roomName,
        user: username,
        password: password
      });

      if (!result.data) {
        setShowPasswordError(true);
        return;
      }

      setCurrentRoom(roomName);
      await loadRoomInfo(roomName);
      await loadMessages(roomName);
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error:', error);
      setShowPasswordError(true);
    }
  }

  async function loadMessages(roomName: string) {
    if (!roomName || !username) return;

    const result = await new LogicApiDataSource().getRoomMessages({
      room_name: roomName,
      user: username
    });

    if (result?.error) {
      console.error('Error:', result.error);
      return;
    }

    setMessages(result.data ?? []);
  }

  async function sendMessage() {
    if (!newMessage || !currentRoom) return;

    const result = await new LogicApiDataSource().sendMessage({
      room_name: currentRoom,
      sender: username,
      content: newMessage
    });

    if (result?.error) {
      console.error('Error:', result.error);
      return;
    }

    setNewMessage('');
    await loadMessages(currentRoom);
  }

  async function handleMessage(message: string) {
    const transferRegex = /^\/send\s+(\d+(?:\.\d+)?)\s+ICP\s+to\s+(\w+)$/i;
    const match = message.match(transferRegex);
    
    if (!match) {
      await sendMessage();
      return;
    }
  
    const amount = parseFloat(match[1]);
    const recipient = match[2];
  
    // Önce cüzdan adresini test edelim
    const response = await new LogicApiDataSource().getWalletAddress({
      username: recipient
    });
    
    console.log("Wallet address response:", response.data);
  
    if (!response.data) {
      // Kullanıcı bulunamadı hatası göster
      return;
    }
  }

  async function deleteRoom() {
    const result = await new LogicApiDataSource().deleteRoom({
      room_name: currentRoom,
      wallet_address: identity
    });

    if (result?.error) {
      setShowDeleteError(true);
      setShowDeleteConfirm(false); 
      return;
    }

    setCurrentRoom('');
    await loadRooms();
    setShowDeleteConfirm(false); 
  }

  useEffect(() => {
    const observeNodeEvents = async () => {
      let subscriptionsClient: SubscriptionsClient = getWsSubscriptionsClient();
      await subscriptionsClient.connect();
      subscriptionsClient.subscribe([getContextId()]);

      subscriptionsClient?.addCallback(() => {
        if (currentRoom) {
          loadMessages(currentRoom);
          loadRooms();
        }
      });
    };

    observeNodeEvents();
  }, [currentRoom]);

  const filteredMessages = messages.filter(([sender, content]) =>
    content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = availableRooms.filter(room =>
    room.toLowerCase().includes(roomSearchQuery.toLowerCase())
  );

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
        connectWallet={() => { }}
        disconnectWallet={disconnectWallet}
        logout={logout}
      />

      <div className="container mx-auto max-w-7xl px-4 pt-20">
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center"> {/* items-start yerine items-center kullandık */}
          <div className="w-full max-w-4xl space-y-8">
            {!currentRoom ? (
              <div className="w-full max-w-md mx-auto space-y-8">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      placeholder="Room name"
                      value={newRoomName}
                      onChange={e => setNewRoomName(e.target.value)}
                      className="w-full bg-gray-800/30 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-500/50 focus:outline-none backdrop-blur-xl border border-gray-700/50"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Room password"
                      value={newRoomPassword}
                      onChange={e => setNewRoomPassword(e.target.value)}
                      className="w-full bg-gray-800/30 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-500/50 focus:outline-none backdrop-blur-xl border border-gray-700/50"
                    />
                  </div>
                  <button
                    onClick={createRoom}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Room
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">
                      Available Rooms
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        placeholder="Search rooms..."
                        value={roomSearchQuery}
                        onChange={e => setRoomSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-gray-500/50 focus:outline-none backdrop-blur-xl border border-gray-700/50"
                      />
                    </div>
                  </div>

                  {filteredRooms.length === 0 ? (
                    <div className="text-gray-400 text-center py-8 bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50">
                      No rooms found
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredRooms.map(room => (
                        <button
                          key={room}
                          onClick={() => handleJoinRoom(room)}
                          className="bg-gray-800/30 hover:bg-gray-700/50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-xl border border-gray-700/50"
                        >
                          {room}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-3xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">
                    {currentRoom}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-grow md:flex-grow-0">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full md:w-auto pl-10 pr-4 py-2 bg-gray-800/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-gray-500/50 focus:outline-none backdrop-blur-xl border border-gray-700/50"
                      />
                    </div>
                    <button
                      onClick={() => setCurrentRoom('')}
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-xl"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Leave
                    </button>
                    {roomCreator === identity && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-2xl h-[calc(100vh-20rem)] overflow-y-auto p-6 space-y-4 backdrop-blur-xl border border-gray-700/50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {filteredMessages.length === 0 ? (
                    <div className="text-gray-400 text-center">
                      {searchQuery ? 'No messages found' : 'No messages yet. Start the conversation!'}
                    </div>
                  ) : (
                    filteredMessages.map(([sender, content, timestamp], index) => (
                      <div
                        key={index}
                        className={`max-w-[70%] ${sender === username ? 'ml-auto' : 'mr-auto'}`}
                      >
                        <div className={`rounded-2xl p-4 shadow-lg ${sender === username
                          ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                          : 'bg-gray-700/50 text-white backdrop-blur-xl'
                          }`}>
                          <div className="font-semibold">{sender}</div>
                          <div className="mt-1">{content}</div>
                          <div className="text-xs opacity-75 mt-2">
                            {new Date(timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-4">
  <input
    placeholder="Type a message..."
    value={newMessage}
    onChange={e => setNewMessage(e.target.value)}
    onKeyPress={e => e.key === 'Enter' && handleMessage(newMessage)}
    className="flex-1 bg-gray-800/30 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-500/50 focus:outline-none backdrop-blur-xl border border-gray-700/50"
  />
  <button
    onClick={() => handleMessage(newMessage)}
    className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-medium px-8 rounded-xl transition-all duration-300 flex items-center gap-2"
  >
    <Send className="w-4 h-4" />
    Send
  </button>
</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onSubmit={async (password) => {
          await joinRoom(selectedRoom, password);
        }}
        onClose={() => setShowPasswordModal(false)}
      />
      <AlertModal
        isOpen={showPasswordError}
        onClose={() => setShowPasswordError(false)}
        title="Wrong Password"
        message="The password you entered is incorrect. Please try again."
        type="error"
      />
      <AlertModal
        isOpen={showRoomExistsAlert}
        onClose={() => setShowRoomExistsAlert(false)}
        title="Room Already Exists"
        message="A room with this name already exists. Please choose a different name."
        type="error"
      />
      <AlertModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Room"
        message="Are you sure you want to delete this room?"
        type="warning"
        onConfirm={() => {
          deleteRoom();
        }}
      />
      <AlertModal
        isOpen={showDeleteError}
        onClose={() => setShowDeleteError(false)}
        title="Permission Denied"
        message="Only the room creator can delete this room."
        type="error"
      />
    </div>
  );
}