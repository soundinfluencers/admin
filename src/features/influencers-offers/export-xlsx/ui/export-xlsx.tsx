
import exportIcon from '@/assets/icons/external-link.svg';

import s from './export-xlsx.module.scss';

export const ExportXlsx = () => {
  return (
    <button
     type="button"
     className={s.exportBtn}
     onClick={() => alert("This function don't implemented yet!")}
     aria-label="Export Xlsx"
    >
      <img
        className={s.exportIcon}
        src={exportIcon}
        width={20}
        height={20}
        alt=""
        aria-hidden
      />
      Export .XLSX
    </button>
  );
};
