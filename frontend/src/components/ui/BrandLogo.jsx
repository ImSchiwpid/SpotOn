import React from 'react';
import { FiMap } from 'react-icons/fi';

const BrandLogo = ({ showText = true, textClassName = '', iconClassName = '' }) => {
  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 ${iconClassName}`}
      >
        <FiMap className="h-5 w-5" />
      </div>
      {showText ? (
        <span className={`text-xl font-extrabold tracking-tight text-primary-700 ${textClassName}`}>SPOT-ON</span>
      ) : null}
    </div>
  );
};

export default BrandLogo;
