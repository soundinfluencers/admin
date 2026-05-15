export type {
  INewClient, INewClientRequestRequest, INewClientRequestResponse, IUpdateNewClientRequestStatusRequest,
} from './model/new-client-request.types';

export { getNewClientRequestApi, updateNewClientRequest } from './api/get-new-client-request';
export { useGetNewClientRequestQuery } from './api/get-new-client-request.queries';
export { newClientQueryKeys } from './api/get-new-client.query-keys';
