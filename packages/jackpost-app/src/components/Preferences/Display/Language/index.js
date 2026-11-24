import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../../../i18n/index';
import { SUPPORTED_LANGUAGES } from '../../../../i18n/language';

const Language = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium" htmlFor="interface-language">Language</label>
      <select
        id="interface-language"
        className="block textbox w-48"
        value={i18n.language}
        onChange={(event) => changeLanguage(event.target.value)}
        data-testid="interface-language"
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  );
};

export default Language;
