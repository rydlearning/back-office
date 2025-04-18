import React from "react";

const DaysSelect = ({ onChange, onBlur, value, invalid }) => {
  const Days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  const handleChange = (event) => {
    const selectedDay = event.target.value;
    onChange(selectedDay);
  };

  return (
    <select
      name="Day"
      className={`form-select ${invalid ? 'is-invalid' : ''}`}
      onChange={handleChange}
      onBlur={onBlur}
      value={value}
    >
      {Days.map((day, index) => (
        <option key={index} value={day}>{day}</option>
      ))}
    </select>
  );
};


// Component for selecting time
const TimeSelect = ({ onChange, onBlur, value, invalid }) => {
  // Array representing 24-hour time options
  const Times = [
    "00:00AM", "1:00AM", "2:00AM", "3:00AM", "4:00AM", "5:00AM", "6:00AM", "7:00AM", "8:00AM", "9:00AM", "10:00AM",
    "11:00AM", "12:00PM", "13:00PM", "14:00PM", "15:00PM", "16:00PM", "17:00PM", "18:00PM", "19:00PM", "20:00PM", "21:00PM",
    "22:00PM", "23:00PM"
  ];

  return (
    <select
      name="Time"
      className={`form-select ${invalid ? 'is-invalid' : ''}`}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
    >
      {Times.map((time, index) => (
        <option key={index} value={time}>{time}</option>
      ))}
    </select>
  );
};

export { DaysSelect, TimeSelect }; // Exporting as named exports
