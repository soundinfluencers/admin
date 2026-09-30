import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ObjectId } from "bson";

import {
  CAMPAIGN_MANAGEMENT_STORAGE_KEY,
  CAMPAIGN_MANAGEMENT_VERSION,
  createCampaignManagementMeta,
  isCampaignManagementExpired,
} from "./campaign-management.persist.ts";

import type { TCampaignManagementState, TCampaignManagementStore } from "./campaign-management-store.types.ts";

import { isValidCampaignPrice } from "@/entities/campaign/model/campaign-price.ts";
import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

const initialCampaignManagementState: TCampaignManagementState = {
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
            const currentParams = state.draft?.params;
            const nextParams = draft.params;

            const isSameDraft =
              currentParams !== undefined &&
              currentParams.campaignId === nextParams.campaignId &&
              currentParams.status === nextParams.status &&
              currentParams.optionIndex === nextParams.optionIndex;

            if (isSameDraft) return state;

            return {
              draft: structuredClone(draft),
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateCampaignName: (name: string) => {
          const nextName = name.trim();

          if (nextName === "") return;

          set((state) => {
            if (state.draft === null || state.draft.campaign.campaignName === nextName) return state;

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

        setPriceHidden: (hidden: boolean) => {
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

        setCpmAndResultHidden: (hidden: boolean) => {
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

        setCampaignPrice: (price: number) => {
          if (!isValidCampaignPrice(price)) return;

          set((state) => {
            if (state.draft === null || state.draft.campaign.price === price) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  price,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setDisplayCurrency: (currency: TCurrency) => {
          set((state) => {
            if (state.draft === null || state.draft.campaign.displayCurrency === currency) return state;

            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  displayCurrency: currency,
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountSelectedContent: (socialAccountId: string, campaignContentItemId: string) => {
          set((state) => {
            if (!state.draft) return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
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
                    (item) => item.socialAccountId === socialAccountId
                      ? { ...item, selectedContent } : item,
                  ),
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        createContentForAccount: (socialAccountId: string, mainLink: string) => {
          set((state) => {
            if (!state.draft) return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
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
                    item.socialAccountId === socialAccountId
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

        setAccountSelectedDescription: (socialAccountId: string, descriptionId: string) => {
          set((state) => {
            if (!state.draft) return state;

            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
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
                    item.socialAccountId === socialAccountId
                    ? { ...item, selectedContent }
                    : item,
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        setAccountSelectedBrief: (socialAccountId: string, additionalBriefId: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
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
              additionalBriefId
            };
            
            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map((item) =>
                    item.socialAccountId === socialAccountId
                    ? { ...item, selectedContent }
                    : item,
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        createDescriptionForAccount: (socialAccountId: string, text: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const trimmedText = text.trim();
            
            if (!trimmedText) return state;
            
            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
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
                    item.socialAccountId === socialAccountId ? 
                      { ...item, selectedContent } : item,
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        createBriefForAccount: (socialAccountId: string, text: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const trimmedText = text.trim();
            
            if (!trimmedText) return state;
            
            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
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
                    item.socialAccountId === socialAccountId ?
                      { ...item, selectedContent } : item,
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateContentDescription: (campaignContentItemId: string, descriptionId: string, text: string) => {
          set((state) => {
            if (!state.draft) return state;
            
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
                        )
                      } : item,
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        updateContentBrief: (campaignContentItemId: string, additionalBriefId: string, text: string) => {
          set((state) => {
            if (!state.draft) return state;
            
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
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        updateContentTaggedUser: (campaignContentItemId: string, taggedUser: string) => {
          set((state) => {
            if (!state.draft) return state;
            
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
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        updateContentTaggedLink: (campaignContentItemId: string, taggedLink: string) => {
          const nextLink = taggedLink.trim();
          
          set((state) => {
            if (!state.draft) return state;
            
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
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        setAccountDateRequest: (socialAccountId: string, dateRequest: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const account = state.draft.campaign.addedAccounts.find(
              (item) => item.socialAccountId === socialAccountId,
            );
            
            if (!account || account.dateRequest === dateRequest) return state;
            
            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts: state.draft.campaign.addedAccounts.map(
                    (item) => 
                      item.socialAccountId === socialAccountId
                        ? { ...item, dateRequest }
                        : item,
                  )
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },

        deleteContentDescription: (campaignContentItemId: string, descriptionId: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const content = state.draft.campaign.campaignContent.find(
              (item) => item._id === campaignContentItemId,
            );
            
            if (!content?.descriptions.some(
              item => item._id === descriptionId
            )) return state;
            
            const descriptions = content.descriptions.filter(
              (item) => item._id !== descriptionId
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
                  })
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        deleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => {
          set((state) => {
            if (!state.draft) return state;
            
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
                      }
                    }
                  })
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        deleteCampaignContent: (campaignContentItemId: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const contentExists = state.draft.campaign.campaignContent.some(
              (item) => item._id === campaignContentItemId
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
                      }
                    }
                  })
                },
              },
              meta: createCampaignManagementMeta(),
            }
          })
        },
        
        removeAccount: (socialAccountId: string) => {
          set((state) => {
            if (!state.draft) return state;
            
            const addedAccounts = state.draft.campaign.addedAccounts.filter(
              (item) => item.socialAccountId !== socialAccountId
            );
            
            if (addedAccounts.length === state.draft.campaign.addedAccounts.length) return state;
            
            return {
              draft: {
                ...state.draft,
                campaign: {
                  ...state.draft.campaign,
                  addedAccounts,
                }
              },
              meta: createCampaignManagementMeta(),
            }
          })
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
