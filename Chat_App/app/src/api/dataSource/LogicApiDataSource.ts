import {
  ApiResponse,
  JsonRpcClient,
  RequestConfig,
  WsSubscriptionsClient,
  RpcError,
  handleRpcError,
  RpcQueryParams,
} from '@calimero-is-near/calimero-p2p-sdk';
import {
  ClientApi,
  ClientMethod,
  CreateRoomRequest,
  JoinRoomRequest,
  SendMessageRequest,
  SignalingRequest,
  GetRoomMessagesRequest, 
  GetRoomUsersRequest,
  LeaveRoomRequest,
  DeleteRoomRequest,
  RegisterUserRequest,
  GetUsernameRequest,
  Room,
  RoomType,
  GetWalletAddressRequest
} from '../clientApi';
import { getContextId, getNodeUrl } from '../../utils/node';
import {
  getJWTObject,
  getStorageAppEndpointKey,
  JsonWebToken,
} from '../../utils/storage';
import { AxiosHeader, createJwtHeader } from '../../utils/jwtHeaders';
import { getRpcPath } from '../../utils/env';

export function getJsonRpcClient() {
  return new JsonRpcClient(getStorageAppEndpointKey() ?? '', getRpcPath());
}

export function getWsSubscriptionsClient() {
  return new WsSubscriptionsClient(getStorageAppEndpointKey() ?? '', '/ws');
}

export function getConfigAndJwt() {
  const jwtObject: JsonWebToken | null = getJWTObject();
  const headers: AxiosHeader | null = createJwtHeader();
  if (!headers || !jwtObject || !jwtObject.executor_public_key) {
    return {
      error: { message: 'Authentication failed', code: 500 },
    };
  }

  return {
    jwtObject,
    config: {
      headers: headers,
      timeout: 10000,
    }
  };
}

export class LogicApiDataSource implements ClientApi {
  async createRoom(request: CreateRoomRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<typeof request> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.CREATE_ROOM,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<typeof request, boolean>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.createRoom);
    }

    return {
      data: true,
      error: null,
    };
  }

  async joinRoom(params: JoinRoomRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const response = await getJsonRpcClient().mutate<JoinRoomRequest, boolean>(
        {
            contextId: jwtObject?.context_id ?? getContextId(),
            method: ClientMethod.JOIN_ROOM,
            argsJson: params,
            executorPublicKey: jwtObject.executor_public_key,
        },
        config
    );

    if (response?.error) {
        return await this.handleError(response.error, params, this.joinRoom);
    }

    return {
        data: response?.result?.output ?? false,
        error: null,
    };
}

  async getRoomMessages(request: GetRoomMessagesRequest): ApiResponse<[string, string, number][]> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<GetRoomMessagesRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_ROOM_MESSAGES,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<GetRoomMessagesRequest, [string, string, number][]>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.getRoomMessages);
    }

    return {
      data: response?.result?.output ?? [],
      error: null,
    };
  }

  async sendMessage(request: SendMessageRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<SendMessageRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.SEND_MESSAGE,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<SendMessageRequest, boolean>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.sendMessage);
    }

    return {
      data: true,
      error: null
    };
  }

  async getRoomUsers(request: GetRoomUsersRequest): ApiResponse<string[]> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<GetRoomUsersRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_ROOM_USERS,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<GetRoomUsersRequest, string[]>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.getRoomUsers);
    }

    return {
      data: response?.result?.output ?? [],
      error: null,
    };
  }

  async leaveRoom(request: LeaveRoomRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<LeaveRoomRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.LEAVE_ROOM,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<LeaveRoomRequest, boolean>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.leaveRoom);
    }

    return {
      data: response?.result?.output ?? false,
      error: null,
    };
  }

  async sendSignaling(request: SignalingRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<SignalingRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.SEND_SIGNALING,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<SignalingRequest, boolean>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.sendSignaling);
    }

    return { data: true, error: null };
  }

  async listRooms(): ApiResponse<string[]> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<void> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.LIST_ROOMS,
      argsJson: {},
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<void, string[]>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, {}, this.listRooms);
    }

    return { data: response?.result?.output ?? [], error: null };
  }

  async deleteRoom(request: DeleteRoomRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<DeleteRoomRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.DELETE_ROOM,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<DeleteRoomRequest, boolean>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.deleteRoom);
    }

    return { data: true, error: null };
  }

  async registerUser(request: RegisterUserRequest): ApiResponse<boolean> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<RegisterUserRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.REGISTER_USER,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<RegisterUserRequest, boolean>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.registerUser);
    }

    return { 
      data: response?.result?.output ?? false, 
      error: null 
  };
  }

  async getUsername(request: GetUsernameRequest): ApiResponse<string | null> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    try {
        const params: RpcQueryParams<GetUsernameRequest> = {
            contextId: jwtObject?.context_id ?? getContextId(),
            method: ClientMethod.GET_USERNAME,
            argsJson: {
                wallet_address: request.wallet_address
            },
            executorPublicKey: jwtObject.executor_public_key,
        };

        const response = await getJsonRpcClient().query<GetUsernameRequest, string>(params, config);

        if (response?.error) {
            return await this.handleError(response.error, request, this.getUsername);
        }

        return { data: response?.result?.output ?? null, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

  async getRoomInfo(request: { room_name: string }): ApiResponse<Room> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<{ room_name: string }> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_ROOM_INFO,
      argsJson: request, 
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<{ room_name: string }, Room>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.getRoomInfo);
    }

    return { data: response?.result?.output, error: null };
  }

  private async handleError(error: RpcError, params: any, callbackFunction: any) {
    if (error?.code) {
      const response = await handleRpcError(error, getNodeUrl);
      if (response.code === 403) {
        return await callbackFunction(params);
      }
      return { error: response };
    }
  }

  async getWalletAddress(request: GetWalletAddressRequest): ApiResponse<string> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) return { error };

    const params: RpcQueryParams<GetWalletAddressRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_WALLET_ADDRESS,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<GetWalletAddressRequest, string>(params, config);

    if (response?.error) {
      return await this.handleError(response.error, request, this.getWalletAddress);
    }

    return { data: response?.result?.output ?? null, error: null };
  }
}