import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Plus, Search, ArrowLeft, Trash2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { RoomType } from '../../api/clientApi';
import { LogicApiDataSource } from '../../api/dataSource/LogicApiDataSource';
import { PasswordModal, AlertModal } from '../../components/Modals';
import { SubscriptionsClient } from '@calimero-is-near/calimero-p2p-sdk';
import { getWsSubscriptionsClient } from '../../api/dataSource/LogicApiDataSource';
import { getContextId } from '../../utils/node';
import { AuthClient } from '@dfinity/auth-client';
import {
    clearAppEndpoint,
    clearJWT,
    getAccessToken,
    getAppEndpointKey,
    getRefreshToken,
} from '@calimero-is-near/calimero-p2p-sdk';
import { getStorageApplicationId } from '../../utils/node';

interface PeerConnection {
    connection: RTCPeerConnection;
    stream: MediaStream;
}

export default function VoicePage() {
    const navigate = useNavigate();
    const [identity, setIdentity] = useState('');
    const [username, setUsername] = useState('');
    const [currentRoom, setCurrentRoom] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomPassword, setNewRoomPassword] = useState('');
    const [availableRooms, setAvailableRooms] = useState<string[]>([]);
    const [roomSearchQuery, setRoomSearchQuery] = useState('');
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);

    // Voice specific states
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peerConnections, setPeerConnections] = useState<Map<string, PeerConnection>>(new Map());
    const [isMuted, setIsMuted] = useState(false);

    // Modal states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [showPasswordError, setShowPasswordError] = useState(false);
    const [showRoomExistsAlert, setShowRoomExistsAlert] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteError, setShowDeleteError] = useState(false);
    const [roomCreator, setRoomCreator] = useState<string>('');

    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

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
        if (username) {
            loadRooms();
        }
    }, [username]);

    useEffect(() => {
        const observeNodeEvents = async () => {
            let subscriptionsClient: SubscriptionsClient = getWsSubscriptionsClient();
            await subscriptionsClient.connect();
            subscriptionsClient.subscribe([getContextId()]);

            subscriptionsClient?.addCallback(async () => {
                if (currentRoom) {
                    await loadRoomMembers();
                }
            });

            return () => {
                subscriptionsClient?.disconnect();
            };
        };

        observeNodeEvents();
    }, [currentRoom]);

    async function loadRoomMembers() {
        if (currentRoom) {
            const result = await new LogicApiDataSource().getRoomUsers({
                room_name: currentRoom
            });
            console.log('Room members:', result.data);
        }
    }

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

    const startVoiceChat = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopVoiceChat = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        peerConnections.forEach((peer) => {
            peer.connection.close();
            peer.stream.getTracks().forEach(track => track.stop());
        });
        setPeerConnections(new Map());
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

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
            room_type: RoomType.Voice
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
            await startVoiceChat();
            setShowPasswordModal(false);
        } catch (error) {
            console.error('Error:', error);
            setShowPasswordError(true);
        }
    }

    async function loadRooms() {
        const result = await new LogicApiDataSource().listRooms();
        if (result?.error) {
            console.error('Error:', result.error);
            return;
        }

        const voiceRooms = await Promise.all(
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
            voiceRooms
                .filter(room => room && room.type === RoomType.Voice)
                .map(room => room!.name)
        );
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

        stopVoiceChat();
        setCurrentRoom('');
        await loadRooms();
        setShowDeleteConfirm(false);
    }

    const handleJoinRoom = (roomName: string) => {
        setSelectedRoom(roomName);
        setShowPasswordModal(true);
    };

    const handleLeaveRoom = async () => {
        try {
            await new LogicApiDataSource().leaveRoom({
                room_name: currentRoom,
                user: username
            });
            stopVoiceChat();
            setCurrentRoom('');
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    };

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
                disconnectWallet={async () => {
                    await authClient?.logout();
                    setIdentity('');
                    setUsername('');
                    navigate('/home');
                }}
                logout={() => {
                    clearAppEndpoint();
                    clearJWT();
                    setIdentity('');
                    setUsername('');
                    navigate('/auth');
                }}
            />

            <div className="container mx-auto max-w-7xl px-4 pt-20">
                <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
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
                                        Create Voice Room
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">
                                            Available Voice Rooms
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
                                        <button
                                            onClick={toggleMute}
                                            className={`${isMuted ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'} font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2`}
                                        >
                                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                            {isMuted ? 'Unmute' : 'Mute'}
                                        </button>
                                        <button
                                            onClick={handleLeaveRoom}
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

                                <div className="bg-gray-800/30 rounded-2xl min-h-[400px] p-6 backdrop-blur-xl border border-gray-700/50">
                                    <div className="text-center text-gray-400">
                                        Voice chat is active. Use the mute button to control your microphone.
                                    </div>
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
                onConfirm={deleteRoom}
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