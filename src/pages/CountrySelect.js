import React, { useEffect, useState } from "react";
import Select from "react-select";
import countriesData from "./countries.json"; 

const africanCountries = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
  "Central African Republic", "Chad", "Comoros", "Congo", "Côte d'Ivoire", "Djibouti", "Egypt", 
  "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", 
  "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", 
  "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", 
  "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", 
  "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

const CountrySelect = ({ onChange, onBlur, value, invalid }) => {
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    if (
      countriesData &&
      countriesData.countries &&
      Array.isArray(countriesData.countries)
    ) {
      const countryOptions = countriesData.countries.map((country) => ({
        value: country.label,
        label: country.label,
      }));

      const africaOption = {
        value: "Africa",
        label: "Africa",
        countries: africanCountries, 
      };

      const diasporaOption = {
        value: "Diaspora",
        label: "Diaspora",
        countries: countryOptions
          .filter((country) => !africanCountries.includes(country.label)) 
          .map((country) => country.label),
      };

      const allOption = { value: "All", label: "All" };
      setCountries([allOption, africaOption, diasporaOption, ...countryOptions]);
    }
  }, []);

  const handleCountryChange = (selectedOptions) => {
    setSelectedCountries(selectedOptions);

    let selectedLabels = [];
    selectedOptions.forEach((option) => {
      if (option.value === "Africa") {
        selectedLabels.push(...option.countries); 
      } else if (option.value === "Diaspora") {
        selectedLabels.push(...option.countries);
      } else {
        selectedLabels.push(option.label); 
      }
    });

    const uniqueLabels = [...new Set(selectedLabels)];

    onChange({
      target: {
        name: "byCountry",
        value: uniqueLabels.join(","),
      },
    });
  };

  return (
    <div>
      <Select
        options={countries}
        placeholder="Select Countries"
        value={selectedCountries}
        onChange={handleCountryChange}
        onBlur={onBlur}
        isMulti
        isClearable={true} 
        className={invalid ? "is-invalid" : ""}
      />
      {invalid && <div className="invalid-feedback">Please choose at least one country.</div>}
    </div>
  );
};

export default CountrySelect;