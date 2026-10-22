import { Fragment } from "react";

import type { getCampaignWhatsAppMessageBlocks } from "../model/campaign-whatsapp-message";

import s from "./campaign-message-preview-content.module.scss";

const MessageText = ({ text }: { text: string }) => (
  <>
    {text.split(/(https?:\/\/\S+)/gi).map((part, index) =>
      /^https?:\/\//i.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )}
  </>
);

interface CampaignMessagePreviewContentProps {
  blocks: ReturnType<typeof getCampaignWhatsAppMessageBlocks>;
}

export const CampaignMessagePreviewContent = ({
  blocks,
}: CampaignMessagePreviewContentProps) => (
  <div className={s.preview}>
    {blocks.map((block, index) => {
      if (block.type === "placement") {
        return (
          <dl
            key={block.addedAccountsId}
            className={s.placement}
          >
            {block.fields.map(([label, value]) => (
              <Fragment key={label}>
                <dt className={s.label}>{label}</dt>

                <dd className={s.value}>
                  <MessageText text={value} />
                </dd>
              </Fragment>
            ))}
          </dl>
        );
      }

      if (block.type === "heading") {
        return (
          <h3 key={`text-${index}`} className={s.heading}>
            {block.text}
          </h3>
        );
      }

      return (
        <p key={`text-${index}`} className={s.text}>
          <MessageText text={block.text} />
        </p>
      );
    })}
  </div>
);
