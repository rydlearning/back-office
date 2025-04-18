import React, { useEffect, useState } from "react";

function StateSelectInput({ country, handleStateChange, className }) {
  const [stateList, setStateList] = useState([]);
  const [selectedState, setSelectedState] = useState({});
  const [toggle, setToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [untouchedStateArr, setUntouchedStateArr] = useState([]);
  const boxStyle = 'relative';

  const handleStateSearch = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
  }
  useEffect(() => {
    if (country && country.states && country.states.length > 0) {
      setStateList(country.states);
      setSelectedState(country.states[0]);
      setUntouchedStateArr(country.states);
    }
  }, [country]);
  

  useEffect(() => {
    const allStates = stateList;
    if (searchQuery === '') {
      setStateList(untouchedStateArr);
    } else {
      const filteredStates = allStates.filter((item) => item?.name?.toLowerCase().includes(searchQuery));
      setStateList(filteredStates);
    }
  }, [searchQuery]);

  return (
    <div className={`${boxStyle}`}>
      <div
        className={`${className} hover:cursor-pointer`}
        onClick={() => setToggle(prevState => !prevState)}
      >
        {selectedState ? selectedState?.name : 'No available state'}
      </div>
      {toggle &&
        <div className="h-[30vh] overflow-y-auto absolute z-10 top-3 w-full shadow bg-white text-ryd-subTextPrimary text-[14px]">
          <input 
            type="search" 
            onChange={handleStateSearch} 
            className="w-full h-[35px] outline-gray-50 px-[20px]" 
            placeholder="Search State..." 
          />
          {stateList.length > 0 ? 
            stateList.map((item, index) => (
              <div key={index} 
                className="hover:bg-ryd-gray px-4 py-1 hover:cursor-pointer" 
                onClick={() => {
                  setSelectedState(item);
                  setToggle(false);
                  handleStateChange(item);
                }}>
                {item?.name}
              </div>
            )) :
            <p className="text-center mt-[15%]">No available state</p>
          }
        </div>
      }
    </div>
  );
}

export default StateSelectInput;