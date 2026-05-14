import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsQueryKeys } from "@/entities/client/api/client.query-keys.ts";
import { deleteClient } from "@/entities/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.lists(),
      });

      navigate(-1);
      toast("Client deleted successfully.", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};
