import type {
  ICampaignDetails,
} from "@/entities/campaign/model/campaign-details.types.ts";

import {
  SOCIAL_MEDIA,
  SOCIAL_MEDIA_LABELS,
  type TSocialMedia,
} from "@/shared/constants/social-media-taxonomy.ts";
import { CURRENCY_LABELS } from "@/shared/constants/currency-taxonomy.ts";

const INFLUENCER_DASHBOARD_URL = "https://www.example.com";

const PLATFORM_PROMO_DETAILS: Partial<Record<TSocialMedia, string>> = {
  [SOCIAL_MEDIA.INSTAGRAM]: "1 post + 1 story",
};

type CampaignMessageSource = Pick<ICampaignDetails, "addedAccounts">;

type CampaignWhatsAppMessageBlock =
  | {
  type: "text" | "heading";
  text: string;
}
  | {
  type: "placement";
  addedAccountsId: string;
  fields: [label: string, value: string][];
};

export interface CampaignWhatsAppPlacement {
  addedAccountsId: string;
  platform: string;
  page: string;
  content: string;
  description: string;
  storyTag: string;
  storyLink: string;
  specialRequest: string;
  reward: string;
}

export interface CampaignWhatsAppMessageData {
  recipientName: string;
  placements: CampaignWhatsAppPlacement[];
}

const normalizeText = (value: string | null | undefined): string =>
  value?.trim() ?? "";

const formatPlatform = (socialMedia: TSocialMedia): string => {
  const label = SOCIAL_MEDIA_LABELS[socialMedia];
  const details = PLATFORM_PROMO_DETAILS[socialMedia];

  return details ? `${label} (${details})` : label;
};

export const buildCampaignWhatsAppMessageData = (
  campaign: CampaignMessageSource,
  influencerId: string,
): CampaignWhatsAppMessageData => {
  if (!influencerId.trim()) {
    throw new Error("Influencer ID is missing");
  }

  const accounts = campaign.addedAccounts.filter(
    (account) => account.influencerId === influencerId,
  );

  const firstAccount = accounts[0];

  if (!firstAccount) {
    throw new Error("No campaign placements found for this influencer");
  }

  const recipientName =
    accounts
    .map((account) => normalizeText(account.firstName))
    .find((name) => name.length > 0) ||
    normalizeText(firstAccount.username);

  const placements = accounts.map(
    (account): CampaignWhatsAppPlacement => {
      const content = account.selectedContentItem;

      const reward =
        Number.isFinite(account.initialPrice) && account.currency
          ? `${account.initialPrice} ${CURRENCY_LABELS[account.currency]}`
          : "";

      return {
        addedAccountsId: account.addedAccountsId,
        platform: formatPlatform(account.socialMedia),
        page: normalizeText(account.username),
        content: normalizeText(content?.mainLink),
        description: normalizeText(content?.description),
        storyTag: normalizeText(content?.taggedUser),
        storyLink: normalizeText(content?.taggedLink),
        specialRequest: normalizeText(content?.additionalBrief),
        reward,
      };
    },
  );

  return {
    recipientName,
    placements,
  };
};

export const getCampaignWhatsAppMessageBlocks = (
  data: CampaignWhatsAppMessageData,
): CampaignWhatsAppMessageBlock[] => {
  if (data.placements.length === 0) {
    throw new Error("Cannot build a message without placements");
  }

  const greeting = data.recipientName
    ? `Hi ${data.recipientName},`
    : "Hi,";

  const introduction =
    data.placements.length === 1
      ? "You have a new promo request."
      : "You have new promo requests.";

  return [
    {
      type: "text",
      text: `${greeting}\n${introduction}`,
    },
    {
      type: "heading",
      text: "CAMPAIGN DETAILS:",
    },
    ...data.placements.map((placement) => {
      const fields: [label: string, value: string][] = [
        ["Platform", placement.platform],
        ["Page", placement.page],
        ["Content", placement.content],
        ["Description", placement.description],
        ["Story Tag", placement.storyTag],
        ["Story Link", placement.storyLink],
        ["Special request", placement.specialRequest],
        ["Reward", placement.reward],
      ];

      return {
        type: "placement" as const,
        addedAccountsId: placement.addedAccountsId,
        fields: fields.filter(([, value]) => value.length > 0),
      };
    }),
    {
      type: "text",
      text: [
        "You can manage this promo(s) in your account here:",
        INFLUENCER_DASHBOARD_URL,
      ].join("\n"),
    },
    {
      type: "text",
      text: "Let us know if you'd like to take part in this campaign(s).",
    },
  ];
};

export const formatCampaignWhatsAppMessage = (
  data: CampaignWhatsAppMessageData,
): string =>
  getCampaignWhatsAppMessageBlocks(data)
  .map((block) =>
    block.type === "placement"
      ? block.fields
      .map(([label, value]) => `*${label}:* ${value}`)
      .join("\n")
      : block.text,
  )
  .join("\n\n");

const escapeEmailHtml = (value: string): string =>
  value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const formatEmailHtmlText = (value: string): string =>
  value
  .split(/(https?:\/\/\S+)/gi)
  .map((part) => {
    const escaped = escapeEmailHtml(part);

    return /^https?:\/\//i.test(part)
      ? `<a href="${escaped}">${escaped}</a>`
      : escaped;
  })
  .join("")
  .replace(/\r\n|\r|\n/g, "<br>");

export const formatCampaignEmailMessage = (
  data: CampaignWhatsAppMessageData,
): { text: string; html: string } => {
  const blocks = getCampaignWhatsAppMessageBlocks(data);

  const text = blocks
  .map((block) =>
    block.type === "placement"
      ? block.fields
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n")
      : block.text,
  )
  .join("\n\n");

  const html = blocks
  .map((block, index) => {
    if (block.type === "placement") {
      const separator =
        blocks[index - 1]?.type === "placement"
          ? `
            <hr
              style="
                border:0;
                border-top:1px solid #E5E7EB;
                margin:16px 0;
              "
            >
          ` : "";

      const rows = block.fields
      .map(
        ([label, value]) => `
              <tr>
                <td style="vertical-align:top;padding:0 16px 8px 0;">
                  <strong>${escapeEmailHtml(label)}:</strong>
                </td>
                <td style="vertical-align:top;padding:0 0 8px 0;">
                  ${formatEmailHtmlText(value)}
                </td>
              </tr>
            `,
      )
      .join("");

      return `
        ${separator}
        <table
          role="presentation"
          style="border-collapse:collapse;margin:0 0 16px;"
        >
          <tbody>${rows}</tbody>
        </table>
      `;
    }

    const content = formatEmailHtmlText(block.text);

    return `
        <p style="margin:0 0 16px;">
          ${
      block.type === "heading"
        ? `<strong>${content}</strong>`
        : content
    }
        </p>
      `;
  })
  .join("");

  return {
    text,
    html: `<div>${html}</div>`,
  };
};
