import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useUpdateListSocialAccountMutation,
} from "@/entities/influencers/api/use-update-list-social-account-mutation.ts";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type InfluencerAccountLinkFormValues, influencerAccountLinkSchema,
} from "@/features/influencers/influencer-account-link-editor/model/influencer-account-link-editor.schema.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

interface UseInfluencerAccountLinkEditorParams {
  influencerId: string;
  accountId: string;
  socialMedia: TSocialMediaValue;
  profileLink: string;
  onClose: () => void;
}

export const useInfluencerAccountLinkEditor = ({
  influencerId,
  accountId,
  socialMedia,
  profileLink,
  onClose,
}: UseInfluencerAccountLinkEditorParams) => {
  const { mutate, isPending } = useUpdateListSocialAccountMutation();

  const methods = useForm<InfluencerAccountLinkFormValues>({
    resolver: zodResolver(influencerAccountLinkSchema),
    defaultValues: {
      newLink: profileLink,
    },
    mode: "onChange",
  });

  const newLink = useWatch({
    control: methods.control,
    name: "newLink",
  });

  const isUnchanged = (newLink ?? "").trim() === profileLink.trim();

  const onSubmit = useCallback((data: InfluencerAccountLinkFormValues) => {
    mutate({
      influencerId,
      accountId,
      socialMedia,
      profileLink: data.newLink.trim(),
    }, {
      onSuccess: () => {
        onClose();
        toast("Influencer account link updated successfully!", {
          type: "success",
          position: "top-right",
          autoClose: 3000,
        });
      },
    });
  }, [mutate, influencerId, accountId, socialMedia, onClose]);

  return {
    methods,
    isUnchanged,
    onSubmit,
    isPending,
  };
};
