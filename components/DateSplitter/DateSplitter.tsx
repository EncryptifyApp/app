import { Text } from 'react-native';
import moment from 'moment';
import React from 'react';

interface Props {
  date: string;
}

export default function DateSplitter({ date }: Props) {
  const dateFormat = 'MMMM D, YYYY'; // Define the format of your input date strings
  const dateObj = moment(date, dateFormat);
  const now = moment();
  const startOfWeek = moment().startOf('week');

  let displayDate;
  if (dateObj.isSame(now, 'day')) {
    displayDate = 'Today'; // Display "Today" if the date is today
  } else if (dateObj.isSame(now.clone().subtract(1, 'days'), 'day')) {
    displayDate = 'Yesterday'; // Display "Yesterday" if the date is yesterday
  } else if (dateObj.isSameOrAfter(startOfWeek) && dateObj.isBefore(now)) {
    displayDate = dateObj.format('dddd'); // Display the day of the week if within the current week
  } else {
    displayDate = dateObj.format(dateFormat); // Display the date in the same format otherwise
  }

  return (
    <Text className="text-center text-sm font-primary-semibold text-gray-300 mb-3 mt-1">
      {displayDate}
    </Text>
  );
}
