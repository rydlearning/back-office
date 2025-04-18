import React, { useState, useEffect } from 'react';
import countriesAndTimezones from 'countries-and-timezones';
import Select from "react-select";

const TimezoneSelect = ({ country, onChange }) => {
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState('');

  useEffect(() => {
    if (country) {
      const timezonesData = countriesAndTimezones.getTimezonesForCountry(country).map(timezone => ({
        value: timezone.name,
        label: timezone.name
      }));
      setTimezones(timezonesData);

      // Automatically select the first timezone associated with the country
      if (timezonesData.length > 0) {
        const defaultTimezone = timezonesData[0].value;
        setSelectedTimezone(defaultTimezone);
        onChange(defaultTimezone);
      } else {
        setSelectedTimezone('');
        onChange('');
      }
    } else {
      setTimezones([]);
      setSelectedTimezone('');
      onChange('');
    }
  }, [country]);

  const handleTimezoneChange = (selectedOption) => {
    setSelectedTimezone(selectedOption.value);
     onChange && onChange(selectedOption.value);
  };

  return (
    <Select
      options={timezones}
      onChange={handleTimezoneChange}
      value={timezones.find(timezone => timezone.value === selectedTimezone)}
      placeholder="Select Timezone"
    />
  );
};

export default TimezoneSelect;
