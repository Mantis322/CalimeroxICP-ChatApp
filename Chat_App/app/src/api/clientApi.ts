import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';

export enum RoomType {
  Chat = 'Chat',
  Voice = 'Voice'
}

export interface CreateRoomRequest {
  name: string;
  password: string;
  creator: string;
  room_type: RoomType;
}

export interface GetWalletAddressRequest {
  username: string;
}

export interface SignalingRequest {
  room_name: string;
  sender: string;
  receiver: string;
  content: string;
}

export interface JoinRoomRequest {
  room_name: string;
  user: string;
  password: string;
}

export interface SendMessageRequest {
  room_name: string;
  sender: string;
  content: string;
}

export interface GetRoomMessagesRequest {
  room_name: string;
  user: string;
}

export interface GetRoomUsersRequest {
  room_name: string;
}

export interface LeaveRoomRequest {
  room_name: string;
  user: string;
}

export interface DeleteRoomRequest {
  room_name: string;
  wallet_address: string;
}

export interface RegisterUserRequest {
  username: string;
  wallet_address: string;
}

export interface GetUsernameRequest {
  wallet_address: string;
}

export interface Room {
  name: string;
  room_type: RoomType;
  creator: string;
}

export enum ClientMethod {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  SEND_MESSAGE = 'send_message',
  GET_ROOM_MESSAGES = 'get_room_messages',
  GET_ROOM_USERS = 'get_room_users',
  LIST_ROOMS = 'list_rooms',
  LEAVE_ROOM = 'leave_room',
  DELETE_ROOM = 'delete_room',
  REGISTER_USER = 'register_user',
  GET_USERNAME = 'get_username',
  SEND_SIGNALING = 'send_signaling',
  GET_ROOM_INFO = 'get_room_info',
  GET_WALLET_ADDRESS = 'get_wallet_address',
}

export interface ClientApi {
  createRoom(params: CreateRoomRequest): ApiResponse<boolean>;
  joinRoom(params: JoinRoomRequest): ApiResponse<boolean>;
  sendMessage(params: SendMessageRequest): ApiResponse<boolean>;
  sendSignaling(params: SignalingRequest): ApiResponse<boolean>;
  getRoomMessages(params: GetRoomMessagesRequest): ApiResponse<[string, string, number][]>;
  getRoomUsers(params: GetRoomUsersRequest): ApiResponse<string[]>;
  listRooms(): ApiResponse<string[]>;
  leaveRoom(params: LeaveRoomRequest): ApiResponse<boolean>;
  deleteRoom(params: DeleteRoomRequest): ApiResponse<boolean>;
  registerUser(params: RegisterUserRequest): ApiResponse<boolean>;
  getUsername(params: GetUsernameRequest): ApiResponse<string | null>;
  getRoomInfo(params: { room_name: string }): ApiResponse<Room>;
  getWalletAddress(params: GetWalletAddressRequest): ApiResponse<string>;
}