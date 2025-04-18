import React from 'react';
import TimezoneSelect from 'react-timezone-select';

const CustomTimezoneSelect = ({ value, onChange, onBlur, error }) => {
  const handleChange = (selectedTimezone) => {
    if (selectedTimezone) {
      const { label, offset } = selectedTimezone;
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      const formattedValue = `(GMT${sign}${absOffset}:00) ${label.split(') ')[1]}`;
      onChange(formattedValue);
    }
  };

  const formatTimezoneLabel = (timezone) => {
    if (timezone) {
      const { label, offset } = timezone;
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      return `(GMT${sign}${absOffset}:00) ${label.split(') ')[1]}`;
    }
    return '';
  };

  const formattedInitialValue = value && {
    label: value.substring(value.indexOf(' ') + 1),
  };

  return (
    <TimezoneSelect
      value={formattedInitialValue}
      onChange={handleChange}
      placeholder="Select Timezone"
      onBlur={onBlur}
      className={error ? 'is-invalid' : ''}
      formatLabel={formatTimezoneLabel}
      formatOptionLabel={formatTimezoneLabel}
    />
  );
};

export default CustomTimezoneSelect;
