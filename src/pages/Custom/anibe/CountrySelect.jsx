import React, { useState, useEffect } from 'react';
import countriesAndTimezones from 'countries-and-timezones';
import Select from "react-select";

const CountrySelect = ({ onChange }) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const countriesData = Object.values(countriesAndTimezones.getAllCountries()).map(country => ({
      value: country.id,
      label: country.name
    }));
    setCountries(countriesData);
  }, []);

  const handleCountryChange = (selectedOption) => {
    onChange(selectedOption.value);
  };

  return (
    <Select
      options={countries}
      onChange={handleCountryChange}
      placeholder="Select Country"
    />
  );
};

export default CountrySelect;