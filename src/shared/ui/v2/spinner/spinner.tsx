import s from './spinner.module.scss';

interface SpinnerProps {
  size?: number;
}

export const Spinner = ({
  size = 14,
}: SpinnerProps) => {
  return (
    <span 
      className={s.spinner}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-hidden="true" 
    />
  );
};
