import checkPaid from "./assets/check-paid.svg";

type Props = {
  isPaid?: boolean;
  canEdit?: boolean;
  onClick?: () => void;
};

export const PaidInsight = ({
  isPaid = false,
  canEdit = false,
  onClick,
}: Props) => {
  return (
    <button
      type="button"
      className="paid-insight"
      onClick={onClick}
      disabled={!canEdit || isPaid}
    >
      {isPaid ? <img src={checkPaid} alt="Paid"/> : null}
    </button>
  );
};
