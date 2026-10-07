import { $api } from '@/app/api/http.ts';
import type { IFileResponse } from "@/entities/file/model/file.types.ts";

export const uploadImageApi = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await $api.post<IFileResponse>('/file', formData);
  
  return data;
};
