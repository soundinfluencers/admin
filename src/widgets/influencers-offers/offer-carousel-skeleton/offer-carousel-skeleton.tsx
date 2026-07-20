import React from "react";

import s from "./offer-carousel-skeleton.module.scss";

interface OfferCarouselSkeletonProps {
  cardsCount?: number;
  accountsCount?: number;
}

export const OfferCarouselSkeleton: React.FC<OfferCarouselSkeletonProps> = ({
  cardsCount = 4,
  accountsCount = 6,
}) => {
  return (
    <div className={s.carousel}>
      <div className={s.content}>
        <div className={s.swiper}>
          <div className={s.slides}>
            {Array.from({ length: cardsCount }).map((_, cardIndex) => (
              <div className={s.slide} key={cardIndex}>
                <article className={s.card}>
                  <div className={s.top}>
                    <div className={s.info}>
                      <div className={s.header}>
                        <span className={s.titleSkeleton} />
                        <span className={s.priceSkeleton} />
                      </div>

                      <div className={s.details}>
                        <span className={s.detailSkeleton} />
                        <span className={s.detailSkeleton} />
                        <span className={s.detailSkeletonWide} />
                      </div>
                    </div>

                    <span className={s.buttonSkeleton} />
                  </div>

                  <div className={s.wrapper}>
                    <ul className={s.list}>
                      {Array.from({ length: accountsCount }).map((_, rowIndex) => (
                        <li className={s.item} key={rowIndex}>
                          <div className={s.account}>
                            <span className={s.logoSkeleton} />
                            <span className={s.accountNameSkeleton} />
                          </div>

                          <span className={s.followersSkeleton} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div className={s.paginationSkeleton}>
            <span className={s.bulletActiveSkeleton} />
            <span className={s.bulletNextSkeleton} />
            <span className={s.bulletSkeleton} />
          </div>
        </div>
      </div>
    </div>
  );
};
