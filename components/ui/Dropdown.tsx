import React, { useState, ChangeEvent } from 'react';
 interface DropdownProps {
  className: string,
  options: string[];
  onOptionChange: (option: string) => void;
}
 const Dropdown: React.FC<DropdownProps> = ({ options, onOptionChange, className }) => {
  const [selectedOption, setSelectedOption] = useState('');
   const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newOption = event.target.value;
    setSelectedOption(newOption);
    onOptionChange(newOption);
  };
   return (
    <div className={className}>
      <select value={selectedOption} onChange={handleChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
 export default Dropdown;