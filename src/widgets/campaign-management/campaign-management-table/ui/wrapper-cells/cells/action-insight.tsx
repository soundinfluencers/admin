import React from "react";

import trash from "./assets/trash-2.svg";
import whatsApp from "./assets/logos_whatsapp-icon.svg";
import email from "./assets/mail.svg";

type Props = {
    onDelete?: () => void;
    onWhatsApp?: () => void;
    onEmail?: () => void;
    disabledDelete?: boolean;
    disabledWhatsApp?: boolean;
    disabledEmail?: boolean;
    onlyDelete?: boolean;
};

export const ActionInsight: React.FC<Props> = ({
                                                   onDelete,
                                                   onWhatsApp,
                                                   onEmail,
                                                   disabledDelete = false,
                                                   disabledWhatsApp = false,
                                                   disabledEmail = false,
                                                   onlyDelete = false,
                                               }) => {
    const showWhatsApp = !onlyDelete && !disabledWhatsApp;
    const showEmail = !onlyDelete && !disabledEmail;

    return (
        <div className="action-insight">
            <button
                type="button"
                className="action-insight__btn"
                onClick={onDelete}
                disabled={disabledDelete}
                aria-label="Delete"
            >
                <img src={trash} alt="" />
            </button>

            {showWhatsApp && (
                <button
                    type="button"
                    className="action-insight__btn"
                    onClick={onWhatsApp}
                    aria-label="Send to WhatsApp"
                >
                    <img src={whatsApp} alt="" />
                </button>
            )}

            {showEmail && (
                <button
                    type="button"
                    className="action-insight__btn"
                    onClick={onEmail}
                    aria-label="Send email"
                >
                    <img src={email} alt="" />
                </button>
            )}
        </div>
    );
};