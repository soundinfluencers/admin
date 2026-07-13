import React from "react";
import { Button, Form, Modal, TextInput } from "@/shared/ui";
import type { TOfferMusicGenre } from "@/features/influencers-offers/offers-filter-by-genres";
import type { TOfferSocialMedia } from "@/features/influencers-offers/offers-filter-by-platform";
import type {
  TCreateOfferFormValues,
} from "@/features/influencers-offers/create-offer/model/create-offer-form.schema.ts";
import { useCreateOfferForm } from "@/features/influencers-offers/create-offer/model/use-create-offer-form.ts";

import s from "./create-offer-modal.module.scss";

interface CreateOfferModalProps {
  socialMedia: TOfferSocialMedia;
  genre: TOfferMusicGenre;
  onClose: () => void;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  socialMedia,
  genre,
  onClose,
}) => {
  const {
    methods,
    onSubmit,
    isPending,
    isError,
  } = useCreateOfferForm({
    socialMedia,
    genre,
    onClose,
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  const handleClose = () => {
    if (isPending) return;

    methods.reset();
    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
      contentClassName={s.modal}
      isShownCloseButton
    >
      <Form
        className={s.form}
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={s.head}>
          <h2 className={s.title}>Create New Offer</h2>
          <p className={s.subtitle}>Write an offer name before selecting influencer pages.</p>
        </div>

        <TextInput<TCreateOfferFormValues>
          name="offerName"
          label="Offer name"
          placeholder="Enter offer name"
          autoComplete="off"
          disabled={isPending}
        />

        {isError && (
          <div role="alert">
            Could not create offer. Please try again.
          </div>
        )}

        <div className={s.actions}>
          <Button
            type="button"
            size="large"
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="large"
            variant="primary"
            disabled={isPending || !isValid}
          >
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
