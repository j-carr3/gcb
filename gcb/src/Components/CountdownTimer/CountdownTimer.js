import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState(0);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const targetDate = new Date(endDate).getTime();

      const remainingTime = targetDate - currentTime;

      if (remainingTime <= 0) {
        clearInterval(interval);
        setCountdown(0);
      } else {
        const seconds = Math.floor((remainingTime / 1000) % 60);
        const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const handleInputChange = (event) => {
    setEndDate(event.target.value);
  };

  return (
    <div>
      <h2>Countdown Timer</h2>
      <div>
        <input type="datetime-local" value={endDate} onChange={handleInputChange} />
      </div>
      <div>
        {countdown.days > 0 && <span>{countdown.days} days </span>}
        {countdown.hours > 0 && <span>{countdown.hours} hours </span>}
        {countdown.minutes > 0 && <span>{countdown.minutes} minutes </span>}
        {countdown.seconds > 0 && <span>{countdown.seconds} seconds </span>}
        {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && (
          <span>Countdown finished!</span>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
