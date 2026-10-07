import { useId, useState } from "react";
import clsx from "clsx";
import { EditorField } from "../editor-field/editor-field.tsx";

import LinkIcon from "@/shared/assets/icons/link.svg?react";

import s from './campaign-story-support.module.scss';

interface CampaignStorySupportProps {
  readOnly: boolean;
  storyLink: string;
  storyTag: string;
  selectedId: string | null;
  onStoryTagChange: (taggedUser: string) => void;
  onStoryLinkChange: (taggedLink: string) => void;
}

export const CampaignStorySupport = ({
  readOnly,
  storyLink,
  storyTag,
  selectedId,
  onStoryTagChange,
  onStoryLinkChange,
}: CampaignStorySupportProps) => {
  const tagsId = useId();
  const linkId = useId();

  const [draftTag, setDraftTag] = useState<string | null>(null);
  const [draftLink, setDraftLink] = useState<string | null>(null);

  const isDisabled = !selectedId;

  const tagValue = readOnly ? storyTag : draftTag ?? storyTag;
  const linkValue = readOnly ? storyLink : draftLink ?? storyLink;

  const handleTagApply = () => {
    if (readOnly || !selectedId || draftTag === null) return;

    if (draftTag !== storyTag) {
      onStoryTagChange(draftTag);
    }

    setDraftTag(null);
  };

  const handleLinkApply = () => {
    if (readOnly || !selectedId || draftLink === null) return;

    const nextLink = draftLink.trim();

    if (nextLink !== storyLink) {
      onStoryLinkChange(nextLink);
    }

    setDraftLink(null);
  };
  
  return (
    <div className={s.storySupport}>
      <EditorField label="Story tags" htmlFor={tagsId}>
        <div className={s.control}>
          <textarea
            id={tagsId}
            className={s.textarea}
            value={tagValue}
            disabled={isDisabled}
            readOnly={readOnly}
            placeholder="Enter story tags"
            onChange={(e) => setDraftTag(e.target.value)}
            onBlur={handleTagApply}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;

              if (e.key === "Escape") {
                e.preventDefault();
                setDraftTag(null);
                return;
              }
            }}
            spellCheck="false"
          />
        </div>
      </EditorField>

      <EditorField label="Story Link URL" htmlFor={linkId}>
        <div className={clsx(s.control, s.input)}>
          <LinkIcon aira-hidden="true" className={s.linkIcon}/>
          <input
            id={linkId}
            className={s.textarea}
            value={linkValue}
            disabled={isDisabled}
            readOnly={readOnly}
            placeholder="Enter story Link URL"
            onChange={(e) => setDraftLink(e.target.value)}
            onBlur={handleLinkApply}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;

              if (e.key === "Escape") {
                e.preventDefault();
                setDraftLink(null);
                return;
              }

              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            spellCheck="false"
          />
        </div>
      </EditorField>
    </div>
  );
};
