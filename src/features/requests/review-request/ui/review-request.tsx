import React from "react";
import { Link } from "react-router-dom";

import s from './review-request.module.scss';

interface ReviewRequestProps {
  to: string;
}

export const ReviewRequest: React.FC<ReviewRequestProps> = ({
  to,
}) => {
  return (
    <Link to={to} className={s.reviewRequest}>
      Review
    </Link>
  );
};
