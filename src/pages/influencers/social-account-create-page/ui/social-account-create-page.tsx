import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useScrollToTopOnRouteChange } from "@/shared/hooks/use-scroll-to-top-on-route-change.ts";
import { PageTitle } from "@/widgets/page-title";
import {
  SocialAccountForm,
  useCreateSocialAccountMutation,
  mapSocialAccountToFormMapper,
  mapSocialAccountForCreateDto,
  type TSocialAccountFormValues,
} from "@/features/influencers/social-account-form";
import { getSocialMediaFromParam, getSocialMediaLabel } from "@/shared/libs/social-media/social-medial.libs.ts";

import s from './social-account-create-page.module.scss';

export const SocialAccountCreatePage = () => {
  useScrollToTopOnRouteChange();
  const { mutateAsync, isPending } = useCreateSocialAccountMutation();
  const { platform, influencerId } = useParams();
  const navigate = useNavigate();
  const socialMedia = getSocialMediaFromParam(platform);

  const defaultValues = useMemo(() => {
    return mapSocialAccountToFormMapper();
  }, []);

  const title = socialMedia
    ? `${getSocialMediaLabel(socialMedia)} Account Setup`
    : "Create your influencer account";

  if (!influencerId) {
    return <div>Influencer ID is missing or invalid.</div>;
  }

  if (!socialMedia) {
    return <div>Social platform is missing or invalid.</div>;
  }

  const onHandleSubmit = async (values: TSocialAccountFormValues) => {
    console.log("Form submitted with values:", values);

    const payload = mapSocialAccountForCreateDto(socialMedia, influencerId, values);

    console.log("Mapped payload to send to API:", payload);

    await mutateAsync(payload);

    navigate(-1);
  };

  return (
    <div className={s.createAccountPage}>
      <PageTitle
        title={title}
        subtitle={"Add your page info and audience insights"}
        className={s.title}
        subtitleClassName={s.subtitle}
      />

      <SocialAccountForm
        mode="create"
        socialMedia={socialMedia}
        defaultValues={defaultValues}
        onHandleSubmit={onHandleSubmit}
        isPending={isPending}
      />
    </div>
  );
};
