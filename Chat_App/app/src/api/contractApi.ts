import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';

export enum RoomType {
    Chat = 'Chat',
    Voice = 'Voice'
}

export interface Message {
    sender: string;
    content: string;
    timestamp: number;
}

export interface RoomInfo {
    name: string;
    roomType: RoomType;
    creator: string;
}

export interface UserProfile {
    username: string;
    walletAddress: string;
}

export interface ContractApi {
    // User Management
    registerUser(username: string, walletAddress: string): ApiResponse<boolean>;
    getUsername(walletAddress: string): ApiResponse<string>;

    // Room Management
    createRoom(name: string, password: string, creator: string, roomType: RoomType): ApiResponse<boolean>;
    deleteRoom(roomName: string, walletAddress: string): ApiResponse<boolean>;
    getRoomInfo(roomName: string): ApiResponse<RoomInfo>;
    listRooms(): ApiResponse<string[]>;

    // Room Participation
    joinRoom(roomName: string, user: string, password: string): ApiResponse<boolean>;
    leaveRoom(roomName: string, user: string): ApiResponse<boolean>;
    getRoomUsers(roomName: string): ApiResponse<string[]>;

    // Messaging
    sendMessage(roomName: string, sender: string, content: string): ApiResponse<boolean>;
    getRoomMessages(roomName: string, user: string): ApiResponse<Array<[string, string, number]>>;
    
    // WebRTC Signaling
    sendSignaling(roomName: string, sender: string, receiver: string, content: string): ApiResponse<boolean>;

    getWalletAddress(username: string): ApiResponse<string>;
}