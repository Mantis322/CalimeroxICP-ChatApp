import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';
import axios from 'axios';
import { ContractApi, Message, RoomInfo, RoomType } from '../contractApi';
import { getStorageAppEndpointKey } from '../../utils/storage';
import { getConfigAndJwt } from './LogicApiDataSource';

export class ChatApiDataSource implements ContractApi {
  private getEndpoint(): string {
    const { jwtObject, error } = getConfigAndJwt();
    if (!jwtObject) {
      throw new Error('JWT object is undefined');
    }
    return `${getStorageAppEndpointKey()}/admin-api/contexts/${jwtObject.context_id}`;
  }

  async registerUser(username: string, walletAddress: string): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.post(`${this.getEndpoint()}/users/register`, {
        username,
        wallet_address: walletAddress
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async getUsername(walletAddress: string): ApiResponse<string> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.get(`${this.getEndpoint()}/users/${walletAddress}/username`);

      return {
        data: response.data ?? "",
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async createRoom(name: string, password: string, creator: string, roomType: RoomType): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.post(`${this.getEndpoint()}/rooms`, {
        name,
        password,
        creator,
        room_type: roomType
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async deleteRoom(roomName: string, walletAddress: string): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.delete(`${this.getEndpoint()}/rooms/${roomName}`, {
        data: { wallet_address: walletAddress }
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async getRoomInfo(roomName: string): ApiResponse<RoomInfo> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.get(`${this.getEndpoint()}/rooms/${roomName}/info`);

      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async listRooms(): ApiResponse<string[]> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.get(`${this.getEndpoint()}/rooms`);

      return {
        data: response.data ?? [],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async joinRoom(roomName: string, user: string, password: string): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.post(`${this.getEndpoint()}/rooms/${roomName}/join`, {
        user,
        password
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async leaveRoom(roomName: string, user: string): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.post(`${this.getEndpoint()}/rooms/${roomName}/leave`, {
        user
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async getRoomUsers(roomName: string): ApiResponse<string[]> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.get(`${this.getEndpoint()}/rooms/${roomName}/users`);

      return {
        data: response.data ?? [],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async sendMessage(roomName: string, sender: string, content: string): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.post(`${this.getEndpoint()}/rooms/${roomName}/messages`, {
        sender,
        content
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async getRoomMessages(roomName: string, user: string): ApiResponse<Array<[string, string, number]>> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.get(`${this.getEndpoint()}/rooms/${roomName}/messages`, {
        params: { user }
      });

      return {
        data: response.data ?? [],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async sendSignaling(roomName: string, sender: string, receiver: string, content: string): ApiResponse<boolean> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.post(`${this.getEndpoint()}/rooms/${roomName}/signal`, {
        sender,
        receiver,
        content
      });

      return {
        data: response.data ?? false,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async getWalletAddress(username: string): ApiResponse<string> {
    try {
      const { jwtObject, error } = getConfigAndJwt();
      if (error) {
        return { error };
      }

      const response = await axios.get(
        `${this.getEndpoint()}/users/${encodeURIComponent(username)}/wallet`
      );

      return {
        data: response.data ?? "",
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }
}