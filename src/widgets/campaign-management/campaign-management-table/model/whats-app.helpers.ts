type WhatsAppPromoData = {
  influencerName: string;
  platform: string;
  page: string;
  content: string;
  description: string;
  storyTag: string;
  storyLink: string;
  specialRequest: string;
  reward: string;
};

type WhatsAppInfluencerPromoData = {
  influencerName: string;
  promos: WhatsAppPromoData[];
};

type PromoField = {
  label: string;
  value: string;
};

const valueToString = (value: any): string => {
  if (value === undefined || value === null || value === "") return "";

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    return value.map(valueToString).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return String(
      value.value ??
      value.label ??
      value.text ??
      value.link ??
      value.url ??
      value.description ??
      value.name ??
      "",
    );
  }

  return String(value);
};

const escapeHtml = (value: string) => {
  return value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
};

const getPromoFields = (promo: WhatsAppPromoData): PromoField[] => {
  const postAndStory =
    promo.platform === 'instagram'
    || promo.platform === 'facebook'
    || promo.platform === 'tiktok';

  return [
    {
      label: "Platform",
      value: postAndStory
        ? `${promo.platform} (1 post + 1 story)`
        : promo.platform,
    },
    { label: "Page", value: promo.page },
    { label: "Content", value: promo.content },
    { label: "Description", value: promo.description },
    { label: "Story Tag", value: promo.storyTag },
    { label: "Story Link", value: promo.storyLink },
    { label: "Special request", value: promo.specialRequest },
    { label: "Reward", value: promo.reward },
  ];
};

export const getInfluencerKey = (account: any) => {
  return String(
    account?.influencerId ??
    account?.influencer?._id ??
    account?.influencerName ??
    account?.username ??
    "",
  );
};

export const groupAccountsByInfluencer = (accounts: any[] = []) => {
  return accounts.reduce<Record<string, any[]>>((acc, account) => {
    const key = getInfluencerKey(account);
    if (!key) return acc;

    if (!acc[key]) acc[key] = [];
    acc[key].push(account);

    return acc;
  }, {});
};

const getSelectedContentItemFromCampaignContent = ({
  selectedRef,
  campaignContent,
}: {
  selectedRef: any;
  campaignContent: any[];
}) => {
  if (!selectedRef) return null;

  return (
    campaignContent.find(
      (item) =>
        String(item?._id) ===
        String(selectedRef?.campaignContentItemId),
    ) ?? null
  );
};

const getSelectedDescription = ({
  selectedRef,
  selectedContentItem,
}: {
  selectedRef: any;
  selectedContentItem: any;
}) => {
  const descriptions = selectedContentItem?.descriptions;

  if (!Array.isArray(descriptions)) return "";

  const selectedDescription = descriptions.find(
    (desc: any) => String(desc?._id) === String(selectedRef?.descriptionId),
  );

  return selectedDescription?.description ?? "";
};

const getRewardValue = (account: any) => {
  const initialPrice = Number(account?.initialPrice ?? 0);

  if (initialPrice > 0) {
    return `${initialPrice} ${valueToString(account?.currency)}`;
  }

  return `${Number(account?.price ?? 0)} EUR`;
};

export const buildWhatsAppPromoData = ({
  account,
  campaignContent,
}: {
  account: any;
  campaignContent: any[];
}): WhatsAppPromoData => {
  const selectedRef =
    account?.selectedCampaignContentItem ??
    account?.selectedContent ??
    null;

  const campaignContentItem = getSelectedContentItemFromCampaignContent({
    selectedRef,
    campaignContent,
  });

  const accountSelectedContentItem = account?.selectedContentItem ?? null;

  const selectedContentItem =
    accountSelectedContentItem ?? campaignContentItem ?? null;

  const selectedDescription = getSelectedDescription({
    selectedRef,
    selectedContentItem: campaignContentItem,
  });

  const description =
    accountSelectedContentItem?.description ??
    selectedDescription ??
    selectedContentItem?.description ??
    "";

  return {
    influencerName: valueToString(
      account?.firstName ||
      account?.influencerName ||
      account?.username ||
      "",
    ),
    platform: valueToString(account?.socialMedia),
    page: valueToString(account?.username),
    content: valueToString(
      accountSelectedContentItem?.mainLink ??
      selectedContentItem?.mainLink,
    ),
    description: valueToString(description),
    storyTag: valueToString(
      accountSelectedContentItem?.taggedUser ??
      selectedContentItem?.taggedUser,
    ),
    storyLink: valueToString(
      accountSelectedContentItem?.taggedLink ??
      selectedContentItem?.taggedLink,
    ),
    specialRequest: valueToString(
      accountSelectedContentItem?.additionalBrief ??
      selectedContentItem?.additionalBrief,
    ),
    reward: getRewardValue(account),
  };
};

export const buildWhatsAppInfluencerPromoData = ({
  accounts,
  campaignContent,
}: {
  accounts: any[];
  campaignContent: any[];
}): WhatsAppInfluencerPromoData => {
  const promos = accounts.map((account) =>
    buildWhatsAppPromoData({
      account,
      campaignContent,
    }),
  );

  return {
    influencerName: valueToString(
      accounts[0]?.firstName ||
      accounts[0]?.influencerName ||
      accounts[0]?.username ||
      "",
    ),
    promos,
  };
};

export const buildInfluencerPromoPlainMessage = (
  data: WhatsAppInfluencerPromoData,
) => {
  const hasMultiplePromos = data.promos.length > 1;

  const promoLines = data.promos.flatMap((promo, index) => {
    const lines = getPromoFields(promo).map(
      (field) => `${field.label}: ${field.value || "—"}`,
    );

    if (index < data.promos.length - 1) {
      return [...lines, ""];
    }

    return lines;
  });

  return [
    `Hi ${data.influencerName || "there"},`,
    `You have ${
      hasMultiplePromos ? "new promo requests" : "a new promo request"
    }.`,
    "",
    "CAMPAIGN DETAILS",
    "",
    ...promoLines,
    "",
    "You can manage this promo(s) in your account here: https://go.soundinfluencers.com/account/influencer/new-promos",
    "Let us know if you'd like to take part in this campaign(s).",
  ].join("\n");
};

export const buildWhatsAppInfluencerPromoMessage = (
  data: WhatsAppInfluencerPromoData,
) => {
  const hasMultiplePromos = data.promos.length > 1;

  const promoLines = data.promos.flatMap((promo, index) => {
    const lines = getPromoFields(promo).map(
      (field) => field.value && `*${field.label}:* ${field.value}`,
    ).filter(line => line);

    if (index < data.promos.length - 1) {
      return [...lines, ""];
    }

    return lines;
  });

  return [
    `Hi ${data.influencerName || "there"},`,
    `You have ${
      hasMultiplePromos ? "new promo requests" : "a new promo request"
    }.`,
    "",
    "*CAMPAIGN DETAILS*",
    "",
    ...promoLines,
    "",
    "You can manage this promo(s) in your account here: https://go.soundinfluencers.com/account/influencer/new-promos",
    "Let us know if you'd like to take part in this campaign(s).",
  ].join("\n");
};

export const buildInfluencerPromoEmailHtml = (
  data: WhatsAppInfluencerPromoData,
) => {
  const hasMultiplePromos = data.promos.length > 1;

  const promoBlocks = data.promos
  .map((promo) => {
    const rows = getPromoFields(promo)
    .map((field) => {
      const label = escapeHtml(field.label);
      const value = escapeHtml(field.value || "—");

      return `
                        <p style="margin:0 0 6px 0;">
                            <strong>${label}:</strong> ${value}
                        </p>
                    `;
    })
    .join("");

    return `
                <div style="margin:0 0 20px 0;">
                    ${rows}
                </div>
            `;
  })
  .join("");

  return `
        <div style="font-family: Arial, sans-serif; font-size:14px; line-height:1.5; color:#2a2a2a;">
            <p style="margin:0 0 8px 0;">Hi ${escapeHtml(data.influencerName || "there")},</p>

            <p style="margin:0 0 16px 0;">
                You have ${
    hasMultiplePromos
      ? "new promo requests"
      : "a new promo request"
  }.
            </p>

            <p style="margin:0 0 12px 0;">
                <strong>CAMPAIGN DETAILS</strong>
            </p>

            ${promoBlocks}

            <p style="margin:0 0 8px 0;">
                You can manage this promo(s) in your account here:<br />
                <a href="https://go.soundinfluencers.com/account/influencer/new-promos">
                    https://go.soundinfluencers.com/account/influencer/new-promos
                </a>
            </p>

            <p style="margin:0;">
                Let us know if you'd like to take part in this campaign(s).
            </p>
        </div>
    `;
};

export const buildWhatsAppPromoMessage = (data: WhatsAppPromoData) => {
  return buildWhatsAppInfluencerPromoMessage({
    influencerName: data.influencerName,
    promos: [data],
  });
};
