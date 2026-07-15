import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TOfferGenre } from "@/features/influencers-offers/offers-filter-by-genres";
import type { TOfferSocialMedia } from "@/features/influencers-offers/offers-filter-by-platform";
import {
  createOfferFormSchema,
  type TCreateOfferFormValues,
} from "@/features/influencers-offers/create-offer/model/create-offer-form.schema.ts";
import { useCreateInfluencersOfferMutation } from "@/features/influencers-offers/create-offer/model/use-create-influencers-offer-mutation.ts";

interface UseCreateOfferFormParams {
  socialMedia: TOfferSocialMedia;
  genre: TOfferGenre;
  onClose: () => void;
}

export const useCreateOfferForm = ({
  socialMedia,
  genre,
  onClose,
}: UseCreateOfferFormParams) => {
  const methods = useForm<TCreateOfferFormValues>({
    resolver: zodResolver(createOfferFormSchema),
    defaultValues: {
      offerName: "",
    },
    mode: "onChange",
  });

  const { mutate, isPending, isError } = useCreateInfluencersOfferMutation();

  const onSubmit: SubmitHandler<TCreateOfferFormValues> = (values) => {
    mutate(
      {
        socialMedia,
        genre,
        offerName: values.offerName.trim(),
      },
      {
        onSuccess: () => {
          methods.reset();
          onClose();
        },
      },
    );
  };

  return {
    methods,
    onSubmit,
    isPending,
    isError,
  };
};
