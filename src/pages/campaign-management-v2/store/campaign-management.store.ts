import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ObjectId } from "bson";

import {
  CAMPAIGN_MANAGEMENT_STORAGE_KEY,
  CAMPAIGN_MANAGEMENT_VERSION,
  createCampaignManagementMeta,
  isCampaignManagementExpired,
} from "./campaign-management.persist.ts";

import { isSameCampaignContext } from "./campaign-management.comparison";

import type {
  TCampaignManagementDraft,
  TCampaignManagementState,
  TCampaignManagementStore,
} from "./campaign-management-store.types.ts";

import { isValidCampaignPrice } from "@/entities/campaign/model/campaign-price.ts";
import { applyPromoPaidToCampaign } from "@/entities/campaign/model/apply-promo-paid-to-campaign.ts";
import { applyWhatsAppUpdatesToCampaign } from "@/entities/campaign/model/apply-whatsapp-updates-to-campaign.ts";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

const initialCampaignManagementState: TCampaignManagementState = {
  baseline: null,
  draft: null,
  meta: {
    updatedAt: null,
    expiresAt: null,
  },
};

export const useCampaignManagementStore =
  create<TCampaignManagementStore>()(
    persist(
      (set) => ({
        ...initialCampaignManagementState,

        initializeDraft: (draft) => {
          set((state) => {
            if (
              state.draft &&
              isSameCampaignContext(state.draft.params, draft.params)
            ) {
              return state;
            }

            return {
              baseline: structuredClone(draft),
              draft: structuredClone(draft),
              meta: createCampaignManagementMeta(),
            };
          });
        },

        updateCampaignName: (name) => {
          const nextName = name.trim();

          if (nextName === "") return;

          set((state) => {
            if (state.draft === null || state.draft.campaign.campaignName === nextName) return state;
            if (state.draft.params.status === "completed") return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignName: nextName,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setPriceHidden: (hidden) => {
          set((state) => {
            if (state.draft === null || state.draft.campaign.isPriceHidden === hidden) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  isPriceHidden: hidden,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setCpmAndResultHidden: (hidden) => {
          set((state) => {
            if (state.draft === null || state.draft.campaign.isCpmAndResultHidden === hidden) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  isCpmAndResultHidden: hidden,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setCampaignPrice: (price) => {
          if (!isValidCampaignPrice(price)) return;

          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const campaign = state.draft.campaign;
            const currency = campaign.displayCurrency;
            const pricesByCurrency = campaign.pricesByCurrency;

            if (campaign.price === price && (pricesByCurrency == null || pricesByCurrency[currency] === price)) return state;
            
            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...campaign,
                  price,
                  ...(pricesByCurrency != null
                    ? {
                      pricesByCurrency: {
                        ...pricesByCurrency,
                        [currency]: price,
                      },
                    }
                    : {}),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setDisplayCurrency: (currency) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const campaign = state.draft.campaign;
            const pricesByCurrency = campaign.pricesByCurrency;

            if (pricesByCurrency == null) return state;

            const price = pricesByCurrency[currency];

            if (campaign.displayCurrency === currency && campaign.price === price) {
              return state;
            }

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...campaign,
                  displayCurrency: currency,
                  price,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountSelectedContent: (addedAccountsId, campaignContentItemId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            if (!account || !content) return state;

            if (account.socialMedia !== content.socialMedia) return state;

            if (account.selectedContent?.campaignContentItemId === campaignContentItemId) return state;

            const selectedContent = {
              campaignContentItemId: content._id,
              descriptionId: content.descriptions?.[0]?._id ?? "",
              additionalBriefId: content.additionalBrief?.[0]?._id ?? "",
            };

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map(
                    (item) => item.addedAccountsId === addedAccountsId
                      ? { ...item, selectedContent } : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        createContentForAccount: (addedAccountsId, mainLink) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account) return state;

            const trimmedLink = mainLink.trim();

            if (!trimmedLink) return state;

            const contentId = new ObjectId().toHexString();

            const newContent: ICampaignDetails["campaignContent"][number] = {
              _id: contentId,
              socialMedia: account.socialMedia,
              profileType: account.profileType,
              socialMediaGroup: "main",
              mainLink: trimmedLink,
              descriptions: [],
              additionalBrief: [],
              taggedLink: "",
              taggedUser: "",
              mediaCache: {},
            };

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: [
                    ...state.draft.campaign.campaignContent,
                    newContent,
                  ],
                  addedAccounts: state.draft.campaign.addedAccounts.map((item) =>
                    item.addedAccountsId === addedAccountsId
                      ? {
                        ...item,
                        selectedContent: {
                          campaignContentItemId: contentId,
                          descriptionId: "",
                          additionalBriefId: "",
                        },
                      }
                      : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountSelectedDescription: (addedAccountsId, descriptionId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account?.selectedContent) return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === account.selectedContent?.campaignContentItemId,
            );

            if (!content) return state;

            const descriptionExist = content.descriptions.some(
              (item) => item._id === descriptionId,
            );

            if (!descriptionExist) return state;

            if (account.selectedContent.descriptionId === descriptionId) return state;

            const selectedContent = {
              ...account.selectedContent,
              descriptionId,
            }

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map((item) =>
                    item.addedAccountsId === addedAccountsId
                      ? { ...item, selectedContent }
                      : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountSelectedBrief: (addedAccountsId, additionalBriefId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account?.selectedContent) return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === account.selectedContent?.campaignContentItemId,
            )

            if (!content) return state;

            const briefExist = content.additionalBrief.some(
              (item) => item._id === additionalBriefId,
            );

            if (!briefExist) return state;

            if (account.selectedContent.additionalBriefId === additionalBriefId) return state;

            const selectedContent = {
              ...account.selectedContent,
              additionalBriefId,
            };

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map((item) =>
                    item.addedAccountsId === addedAccountsId
                      ? { ...item, selectedContent }
                      : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        createDescriptionForAccount: (addedAccountsId, text) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const trimmedText = text.trim();

            if (!trimmedText) return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account?.selectedContent) return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === account.selectedContent?.campaignContentItemId,
            );

            if (!content) return state;

            const descriptionId = new ObjectId().toHexString();

            const newDescription = {
              _id: descriptionId,
              description: trimmedText,
            };

            const selectedContent = {
              ...account.selectedContent,
              descriptionId,
            };

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === content._id ?
                      {
                        ...item,
                        descriptions: [
                          ...(item.descriptions ?? []),
                          newDescription,
                        ],
                      } : item,
                  ),
                  addedAccounts: state.draft.campaign.addedAccounts.map((item) =>
                    item.addedAccountsId === addedAccountsId ?
                      { ...item, selectedContent } : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        createBriefForAccount: (addedAccountsId, text) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const trimmedText = text.trim();

            if (!trimmedText) return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account?.selectedContent) return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === account.selectedContent?.campaignContentItemId,
            );

            if (!content) return state;

            const briefId = new ObjectId().toHexString();

            const newBrief = {
              _id: briefId,
              additionalBrief: trimmedText,
            };

            const selectedContent = {
              ...account.selectedContent,
              additionalBriefId: briefId,
            };

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === content._id ?
                      {
                        ...item,
                        additionalBrief: [
                          ...(item.additionalBrief ?? []),
                          newBrief,
                        ],
                      } : item,
                  ),
                  addedAccounts: state.draft.campaign.addedAccounts.map((item) =>
                    item.addedAccountsId === addedAccountsId ?
                      { ...item, selectedContent } : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateContentDescription: (campaignContentItemId, descriptionId, text) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const nextText = text.trim();

            if (!nextText) return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            const description = content?.descriptions.find(
              (item) => item._id === descriptionId,
            );

            if (!description || description.description === nextText) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === campaignContentItemId ?
                      {
                        ...item,
                        descriptions: item.descriptions.map((desc) =>
                          desc._id === descriptionId ?
                            { ...desc, description: nextText }
                            : desc,
                        ),
                      } : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateContentBrief: (campaignContentItemId, additionalBriefId, text) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const nextText = text.trim();

            if (!nextText) return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            const brief = content?.additionalBrief.find(
              (item) => item._id === additionalBriefId,
            );

            if (!brief || brief.additionalBrief === nextText) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === campaignContentItemId ?
                      {
                        ...item,
                        additionalBrief: item.additionalBrief.map((brief) =>
                          brief._id === additionalBriefId ?
                            { ...brief, additionalBrief: nextText }
                            : brief,
                        ),
                      } : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateContentTaggedUser: (campaignContentItemId, taggedUser) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            if (!content || content.taggedUser === taggedUser) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === campaignContentItemId
                      ? { ...item, taggedUser }
                      : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateContentTaggedLink: (campaignContentItemId, taggedLink) => {
          const nextLink = taggedLink.trim();

          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            if (!content || content.taggedLink === nextLink) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === campaignContentItemId
                      ? { ...item, taggedLink: nextLink }
                      : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountDateRequest: (addedAccountsId, dateRequest) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account || account.dateRequest === dateRequest) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map(
                    (item) =>
                      item.addedAccountsId === addedAccountsId
                        ? { ...item, dateRequest }
                        : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountPostLink: (addedAccountsId, postLink) => {
          const nextPostLink = postLink.trim();
          
          set((state) => {
            if (!state.draft) return state;

            if (state.draft.params.status !== "distributing") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account || (account.postLink ?? "") === nextPostLink) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map(
                    (item) =>
                      item.addedAccountsId === addedAccountsId
                        ? { ...item, postLink: nextPostLink }
                        : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountScreenshot: (addedAccountsId, screenshot) => {
          const nextScreenshot = screenshot.trim();

          set((state) => {
            if (!state.draft) return state;

            if (state.draft.params.status !== "distributing") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account || (account.screenshot ?? "") === nextScreenshot) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map(
                    (item) =>
                      item.addedAccountsId === addedAccountsId
                        ? { ...item, screenshot: nextScreenshot }
                        : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountMetricField: (addedAccountsId, field, value) => {
          if (!Number.isSafeInteger(value) || value < 0) return;

          set((state) => {
            if (!state.draft) return state;

            if (state.draft.params.status !== "distributing") return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.addedAccountsId === addedAccountsId,
            );

            if (!account || account[field] === value) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map(
                    (item) =>
                      item.addedAccountsId === addedAccountsId
                        ? { ...item, [field]: value }
                        : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        applyPromoPaid: (result) => {
          const { campaignId } = result;
          set((state) => {
            const applyToSnapshot = (
              snapshot: TCampaignManagementDraft | null,
            ): TCampaignManagementDraft | null => {
              if (!snapshot || snapshot.params.campaignId !== campaignId) {
                return snapshot;
              }

              const campaign = applyPromoPaidToCampaign(snapshot.campaign, result);

              if (campaign === snapshot.campaign) return snapshot;

              return { ...snapshot, campaign };
            };

            const baseline = applyToSnapshot(state.baseline);
            const draft = applyToSnapshot(state.draft);

            if (baseline === state.baseline && draft === state.draft) {
              return state;
            }

            return { baseline, draft };
          });
        },

        applyWhatsAppUpdates: (params, updates) => {
          set((state) => {
            const applyToSnapshot = (
              snapshot: TCampaignManagementDraft | null,
            ): TCampaignManagementDraft | null => {
              if (
                !snapshot ||
                !isSameCampaignContext(snapshot.params, params)
              ) {
                return snapshot;
              }

              const campaign = applyWhatsAppUpdatesToCampaign(
                snapshot.campaign,
                updates,
              );

              return campaign === snapshot.campaign
                ? snapshot
                : { ...snapshot, campaign };
            };

            const baseline = applyToSnapshot(state.baseline);
            const draft = applyToSnapshot(state.draft);

            if (
              baseline === state.baseline &&
              draft === state.draft
            ) {
              return state;
            }

            return { baseline, draft };
          });
        },

        deleteContentDescription: (campaignContentItemId, descriptionId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            if (!content?.descriptions.some(
              item => item._id === descriptionId,
            )) return state;

            const descriptions = content.descriptions.filter(
              (item) => item._id !== descriptionId,
            );

            const fallbackId = descriptions[0]?._id ?? "";

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === campaignContentItemId
                      ? { ...item, descriptions }
                      : item,
                  ),
                  addedAccounts: state.draft.campaign.addedAccounts.map((account) => {
                    const selected = account.selectedContent;

                    if (
                      !selected ||
                      selected.campaignContentItemId !== campaignContentItemId ||
                      selected.descriptionId !== descriptionId
                    ) return account;

                    return {
                      ...account,
                      selectedContent: {
                        ...selected,
                        descriptionId: fallbackId,
                      },
                    }
                  }),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        deleteContentBrief: (campaignContentItemId, additionalBriefId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );

            if (!content?.additionalBrief.some(
              item => item._id === additionalBriefId,
            )) return state;

            const additionalBrief = content?.additionalBrief.filter(
              (item) => item._id !== additionalBriefId,
            );

            const fallbackId = additionalBrief[0]?._id ?? "";

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.map((item) =>
                    item._id === campaignContentItemId
                      ? { ...item, additionalBrief }
                      : item,
                  ),
                  addedAccounts: state.draft.campaign.addedAccounts.map((account) => {
                    const selected = account.selectedContent;

                    if (
                      !selected ||
                      selected.campaignContentItemId !== campaignContentItemId ||
                      selected.additionalBriefId !== additionalBriefId
                    ) return account;

                    return {
                      ...account,
                      selectedContent: {
                        ...selected,
                        additionalBriefId: fallbackId,
                      },
                    }
                  }),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        deleteCampaignContent: (campaignContentItemId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const contentExists = state.draft.campaign.campaignContent.some(
              (item) => item._id === campaignContentItemId,
            );

            if (!contentExists) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  campaignContent: state.draft.campaign.campaignContent.filter(
                    (item) => item._id !== campaignContentItemId,
                  ),
                  addedAccounts: state.draft.campaign.addedAccounts.map((account) => {
                    if (account.selectedContent?.campaignContentItemId !== campaignContentItemId) return account;

                    return {
                      ...account,
                      selectedContent: {
                        campaignContentItemId: "",
                        descriptionId: "",
                        additionalBriefId: "",
                      },
                    }
                  }),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        removeAccount: (addedAccountsId) => {
          set((state) => {
            if (!state.draft) return state;
            if (state.draft.params.status === "completed") return state;

            const addedAccounts = state.draft.campaign.addedAccounts.filter(
              (item) => item.addedAccountsId !== addedAccountsId,
            );

            if (addedAccounts.length === state.draft.campaign.addedAccounts.length) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        restoreBaseline: () => {
          set((state) => {
            if (
              !state.draft ||
              !state.baseline ||
              !isSameCampaignContext(
                state.draft.params,
                state.baseline.params,
              )
            ) {
              return state;
            }

            return {
              draft: structuredClone(state.baseline),
              meta: createCampaignManagementMeta(),
            };
          });
        },

        applySavedCampaign: (params, campaign) => {
          set((state) => {
            if (!state.draft || !isSameCampaignContext(state.draft.params, params)) {
              return state;
            }

            const savedDraft: TCampaignManagementDraft = {
              params,
              campaign,
            };

            return {
              baseline: structuredClone(savedDraft),
              draft: structuredClone(savedDraft),
              meta: createCampaignManagementMeta(),
            };
          });
        },

        resetDraft: () => {
          set(initialCampaignManagementState);
        },
      }),

      {
        name: CAMPAIGN_MANAGEMENT_STORAGE_KEY,
        version: CAMPAIGN_MANAGEMENT_VERSION,
        storage: createJSONStorage(() => localStorage),

        partialize: (state) => ({
          baseline: state.baseline,
          draft: state.draft,
          meta: state.meta,
        }),

        onRehydrateStorage: () => {
          return (state) => {
            if (!state) return;

            if (isCampaignManagementExpired(state.meta.expiresAt)) {
              state.resetDraft();
            }
          }
        },
      },
    ),
  );
