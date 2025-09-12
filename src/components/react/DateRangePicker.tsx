import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

interface DateRangePickerProps {
  onRangeChange: (range: any) => void;
}

const DateRange: React.FC<DateRangePickerProps> = ({ onRangeChange }) => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection'
    }
  ]);

  const handleOnChange = (ranges: any) => {
    const { selection } = ranges;
    setState([selection]);
    onRangeChange(selection);
  }

  return (
    <DateRangePicker
      onChange={handleOnChange}
      showSelectionPreview={true}
      moveRangeOnFirstSelection={false}
      months={2}
      ranges={state}
      direction="horizontal"
    />
  );
};

export default DateRange;
