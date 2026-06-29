import s from './dot-loader.module.scss';

export const DotLoader = () => {
  return (
    <div className={s.dotLoader}>
      <div className={s.dot} />
      <div className={s.dot} />
      <div className={s.dot} />
      <div className={s.dot} />
    </div>
  );
};
