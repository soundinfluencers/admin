import React from "react";
import styles from "./option-slider.module.scss";
import chevron from "@/assets/icons/chevron-right.svg";
import x from "@/assets/icons/x (2).svg";

type Props = {
    className?: string;
    activeOption: number;
    optionIndexes: number[] | undefined;
    onChangeOption: (optionIndex: number) => void;
    onDeleteOption?: (optionIndex: number) => void;
};

export function OptionsSlider({
                                  className,
                                  optionIndexes,
                                  activeOption,
                                  onChangeOption,
                                  onDeleteOption,
                              }: Props) {
    const scrollerRef = React.useRef<HTMLUListElement | null>(null);

    const [canScroll, setCanScroll] = React.useState(false);
    const [atStart, setAtStart] = React.useState(true);
    const [atEnd, setAtEnd] = React.useState(false);

    const canDeleteOption = Number(optionIndexes?.length ?? 0) > 1;

    const update = React.useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const can = el.scrollWidth > el.clientWidth + 1;
        setCanScroll(can);
        setAtStart(el.scrollLeft <= 0);
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    }, []);

    React.useEffect(() => {
        update();

        const el = scrollerRef.current;
        if (!el) return;

        const onScroll = () => update();
        el.addEventListener("scroll", onScroll, {passive: true});

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        return () => {
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        };
    }, [update]);

    const scrollByPage = (dir: -1 | 1) => {
        const el = scrollerRef.current;
        if (!el) return;

        el.scrollBy({
            left: dir * Math.round(el.clientWidth * 0.8),
            behavior: "smooth",
        });
    };

    return (
        <div className={styles.optionsSlider}>
            {canScroll && (
                <button
                    type="button"
                    className={`${styles.arrow} ${styles.left}`}
                    onClick={() => scrollByPage(-1)}
                    disabled={atStart}
                    aria-label="Scroll left"
                >
                    <img className={styles.arrowIconLeft} src={chevron} alt=""/>
                </button>
            )}

            <ul ref={scrollerRef} className={styles.optionListScroll}>
                {optionIndexes?.map((idx) => (
                    <li
                        key={idx}
                        className={[
                            styles.optionItem,
                            activeOption === idx ? styles.activeOption : "",
                            className ?? "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => onChangeOption(idx)}
                    >
                        <span>Option {idx + 1}</span>

                        {canDeleteOption && onDeleteOption && (
                            <button
                                type="button"
                                className={styles.deleteOption}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteOption(idx);
                                }}
                                aria-label={`Delete option ${idx + 1}`}
                            >
                                <img src={x} alt=""/>
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {canScroll && (
                <button
                    type="button"
                    className={`${styles.arrow} ${styles.right}`}
                    onClick={() => scrollByPage(1)}
                    disabled={atEnd}
                    aria-label="Scroll right"
                >
                    <img className={styles.arrowIcon} src={chevron} alt=""/>
                </button>
            )}
        </div>
    );
}