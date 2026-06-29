import { useMemo } from "react";
import equal from 'fast-deep-equal';
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useSocialAccountQuery } from "@/entities/influencers/social-account/api/social-account.queries.ts";
import { useScrollToTopOnRouteChange } from "@/shared/hooks/use-scroll-to-top-on-route-change.ts";
import {
  useUpdateSocialAccountMutation,
  useDeleteSocialAccountMutation,
  SocialAccountForm,
  mapSocialAccountToFormMapper,
  mapSocialAccountForUpdateDto,
  mapSocialAccountForDeleteDto,
  type TSocialAccountFormValues,
} from "@/features/influencers/social-account-form";
import { getSocialMediaFromParam, getSocialMediaLabel } from "@/shared/libs/social-media/social-medial.libs.ts";

import { PageTitle } from "@/widgets/page-title";

import s from './social-account-edit-page.module.scss';

export const SocialAccountEditPage = () => {
  useScrollToTopOnRouteChange();
  const { platform, accountId, influencerId } = useParams();
  const navigate = useNavigate();
  const socialMedia = getSocialMediaFromParam(platform);

  const { data, isPending, isError } = useSocialAccountQuery({
    influencerId,
    accountId,
    socialMedia,
  });

  const { mutateAsync: updateMutate, isPending: isUpdatePending } = useUpdateSocialAccountMutation();
  const { mutate: deleteMutate, isPending: isDeletePending } = useDeleteSocialAccountMutation();

  const defaultValues = useMemo(() => {
    return data ? mapSocialAccountToFormMapper(data) : null;
  }, [data]);

  const title = socialMedia
    ? `Edit your ${getSocialMediaLabel(socialMedia)} Account Setup`
    : "Edit your influencer account";

  if (!socialMedia) {
    return <div>Social platform is missing or invalid.</div>;
  }

  if (!accountId) {
    return <div>Account id is missing or invalid.</div>;
  }

  if (!influencerId) {
    return <div>Influencer ID is missing or invalid.</div>;
  }

  const onHandleSubmit = async (values: TSocialAccountFormValues) => {
    if (!defaultValues) return;
    console.log("Form submitted with values:", values);

    const initialPayload = mapSocialAccountForUpdateDto(
      defaultValues,
      socialMedia,
      accountId,
      influencerId,
    );

    const payload = mapSocialAccountForUpdateDto(
      values,
      socialMedia,
      accountId,
      influencerId,
    );

    const isChanged = !equal(payload, initialPayload);

    if (!isChanged) {
      navigate(-1);
      return;
    }

    console.log("Mapped payload to send to API:", payload);

    await updateMutate(payload);

    navigate(-1);

    toast("Social account updated successfully!", {
      type: "success",
      position: "top-right",
      autoClose: 3000,
    });

    console.log("Update mutation called successfully with payload:", payload);
  };

  const onHandleDelete = () => {
    console.log("Delete account with id:", accountId);

    const payload = mapSocialAccountForDeleteDto(socialMedia, accountId, influencerId);

    console.log("Delete mutation called with payload:", payload);

    deleteMutate(payload, {
      onSuccess: () => {
        navigate(-1);

        toast("Social account deleted successfully!", {
          type: "success",
          position: "top-right",
          autoClose: 3000,
        });
      }
    });

    console.log("Delete mutation successfully with payload:", payload);
  }

  return (
    <div className={s.editAccountPage}>
      <PageTitle
        title={title}
        className={s.title}
      />

      {isPending && !data ? (
        <div>Loading...</div>
      ) : isError || !defaultValues ? (
        <div>Could not load social account. Please refresh the page.</div>
      ) : (
        <SocialAccountForm
          mode="edit"
          socialMedia={socialMedia}
          defaultValues={defaultValues}
          onHandleSubmit={onHandleSubmit}
          onHandleDelete={onHandleDelete}
          isPending={isUpdatePending}
          isDeletePending={isDeletePending}
        />
      )}
    </div>
  );
};
