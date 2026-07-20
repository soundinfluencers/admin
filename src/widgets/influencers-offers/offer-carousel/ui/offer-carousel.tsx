import React, { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Pagination } from "swiper/modules";
import { OfferCard } from "../../offer-card/ui/offer-card.tsx";

import type { IOffersClients } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import ChevronIcon from '@/assets/icons/chevron-right.svg?react';

import type { Swiper as SwiperClass } from "swiper/types";

import 'swiper/css';
import 'swiper/css/pagination';
import s from './offer-carousel.module.scss';
import { OfferCarouselSkeleton } from "@/widgets/influencers-offers/offer-carousel-skeleton";

interface OfferCarouselProps {
  offers:  IOffersClients[];
  isLoading: boolean;
  isError: boolean;
}

export const OfferCarousel: React.FC<OfferCarouselProps> = ({
  offers,
  isLoading,
  isError,
}) => {
  const swiperRef = useRef<SwiperClass | null>(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNavigationState = useCallback((swiper: SwiperClass) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  }, []);

  const handlePrevClick = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNextClick = () => {
    swiperRef.current?.slideNext();
  };

  if (isLoading) {
    return <OfferCarouselSkeleton />
  }

  if (isError) {
    return <div>Failed to load offers. Please try again later.</div>;
  }

  if (offers.length === 0) {
    return <div>No offers match the selected filters. Try adjusting your filters.</div>;
  }

  return (
    <div className={s.carousel}>
      <button
        className={clsx(s.arrow, s.prev)}
        type="button"
        disabled={!canPrev}
        onClick={handlePrevClick}
      >
        <ChevronIcon className={clsx(s.icon)}/>
      </button>

      <div className={s.content}>
        <Swiper
          modules={[Pagination, A11y]}
          className={s.swiper}
          slidesPerView="auto"
          slidesPerGroup={1}
          spaceBetween={24}
          speed={400}
          watchOverflow
          pagination={{
            clickable: true,
            bulletElement: "button",
            bulletClass: s.bullet,
            bulletActiveClass: s.bulletActive,
          }}
          breakpoints={{
            0: {
              spaceBetween: 16,
            },
            1440: {
              spaceBetween: 24,
            },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigationState(swiper);
          }}
          onSlideChange={updateNavigationState}
          onResize={updateNavigationState}
          onBreakpoint={updateNavigationState}
        >
          {offers.map((offer) => {
            return (
              <SwiperSlide key={offer._id} className={s.slide}>
                <OfferCard
                  offer={offer}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <button
        className={clsx(s.arrow, s.next)}
        type="button"
        disabled={!canNext}
        onClick={handleNextClick}
      >
        <ChevronIcon className={clsx(s.icon)}/>
      </button>
    </div>
  );
};
