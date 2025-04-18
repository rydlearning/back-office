import React, { useEffect, useState } from "react";
  

const  countriesArr = require('./countries.json');

export default function CountrySelectInput({ handleCountryChange, className }) {
  const [ countries, setCountries ] = useState([]);
  const [ selectedCountry, setSelectedCountry ] = useState({});
  const [ toggle, setToggle ] = useState(false);
  const [ searchQuery, setSearchQuery ] = useState('');
  const boxStyle = 'relative';


  const handleCountrySearch = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
  }



  useEffect(() => {
    setCountries(countriesArr);
    setSelectedCountry(countriesArr[0])
    handleCountryChange(countriesArr[0])
  },[]);

  useEffect(() => {
    if(searchQuery === ''){
      setCountries(countriesArr)
    }else{
      const filteredCountries = countriesArr.filter((item) => item.name.toLowerCase().includes(searchQuery));
      setCountries(filteredCountries);
    }
  }, [searchQuery]);


  return (
    <div className={`${boxStyle}`}>
      <div
        className={`${className} hover:cursor-pointer`}
        onClick={() => setToggle(prevState => !prevState)}
      >
        {selectedCountry.name}
      </div>
      {toggle &&
        <div className="h-[30vh] z-20 overflow-y-auto absolute top-3 w-full shadow bg-white text-ryd-subTextPrimary text-[14px]">
          <input 
            type="search" 
            onChange={handleCountrySearch} 
            className="w-full h-[35px] outline-gray-50 px-[20px]" 
            placeholder="Search Country..." 
            />

          {countries.length > 0 && countries.map((item, index) => (
            <div key={index} 
              className="hover:bg-ryd-gray px-4 py-1 hover:cursor-pointer" 
              onClick={() => {
                setSelectedCountry(item);
                setToggle(false)
                handleCountryChange(item);
                }}>
              {item.name}
            </div>
          ))}
        </div>
      }
    </div>
  )
}
