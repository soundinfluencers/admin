import { Button } from "@/shared/ui";
import { useCloseRequestMutation } from "../model/use-close-request-mutation";
import { CircleLoader } from "@/shared/ui/circle-loader/circle-loader.tsx";

interface CloseRequestProps {
  requestId: string;
}

export const CloseRequest = ({
  requestId,
}: CloseRequestProps) => {
  const { mutate, isPending } = useCloseRequestMutation();

  const handleCloseRequest = () => {
    mutate({
      requestId,
    });
  };

  return (
    <Button
      type="button"
      size="large"
      onClick={handleCloseRequest}
      disabled={isPending}
      style={{
        margin: "0 auto"
      }}
    >
      {isPending ? <CircleLoader/> : "Ok"}
    </Button>
  );
};
