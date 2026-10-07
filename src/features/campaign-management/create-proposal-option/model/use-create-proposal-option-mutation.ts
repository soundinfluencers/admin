import { useMutation } from "@tanstack/react-query";
import { createProposalOption } from "@/entities/campaign";

export const useCreateProposalOption = () => {
  return useMutation({
    mutationFn: createProposalOption,
  });
};
