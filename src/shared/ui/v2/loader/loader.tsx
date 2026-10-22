import type { CSSProperties } from "react";
import s from './loader.module.scss';

// Geometry from Figma node 44:7807, ordered from left to right.
const BARS = [
  { height: 15, radius: 5.8824 },
  { height: 49, radius: 5.7422 },
  { height: 89, radius: 7.79562 },
  { height: 33, radius: 6.1875 },
  { height: 49, radius: 5.7422 },
  { height: 85, radius: 7.44525 },
  { height: 81, radius: 7.0949 },
  { height: 29, radius: 5.4375 },
  { height: 15, radius: 5.8824 },
];

interface BarStyle extends CSSProperties {
  '--loader-bar-height': number;
  '--loader-bar-radius': number;
}

interface LoaderProps {
  label?: string;
}

export const Loader = ({ label = "Loading…" }: LoaderProps) => (
  <div className={s.loader} role="status">
    <span className={s.label}>{label}</span>
    <div className={s.bars} aria-hidden="true">
      {BARS.map((bar, index) => {
        const style: BarStyle = {
          '--loader-bar-height': bar.height,
          '--loader-bar-radius': bar.radius,
        };

        return <span key={index} className={s.bar} style={style} />;
      })}
    </div>
  </div>
);
