import { useState } from "react";
import { toast } from "react-toastify";

import img from "../../assets/rotate-ccw.svg";
import styles from "./update-insight.module.scss";

import { updateAllPostDetails } from "@/entities/campaign-managment/api/campaign-controls.api.ts";
import { useRealtime } from "@/app/providers/realtime-provider/use-realtime.ts";

type Props = {
    campaignId: string | null;
    campaignName: string;
    onSuccess?: () => Promise<void> | void;
};

export const UpdateInsight = ({
                                  campaignId,
                                  campaignName,
                                  onSuccess,
                              }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const { clientId, isConnected } = useRealtime();

    const handleUpdate = async () => {
        if (!campaignId) return;

        if (!clientId || !isConnected) {
            toast.error("Socket client is not ready");
            return;
        }

        try {
            setIsLoading(true);

            await updateAllPostDetails({
                campaignId,
                campaignName,
                clientId,
            });

            await onSuccess?.();

            toast.success("Insights update started");
        } catch (error) {
            console.error("Failed to update insights", error);
            toast.error("Failed to update insights");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            className={styles.updateInsight}
            onClick={handleUpdate}
            disabled={isLoading || !campaignId || !clientId || !isConnected}
        >
            <img src={img} alt="" />
            <p>{isLoading ? "Updating..." : "Update Insights"}</p>
        </button>
    );
};