import React, { useState, useEffect } from 'react';
import Parse from 'parse';

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState(0);
  const [endDate, setEndDate] = useState('');
  const [succintDesc, setSuccintDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedTimes, setSubmittedTimes] = useState([]);


  // This needs to be fixed but i'm too tired and it's twisting me in knots
  // apparently there is a huge problem with utc vs. est vs. dst times that I didn't know about until tonight
  const getESTTime = () => {
    const now = new Date();
    const dstDate = new Date(2022, 5, 1);
    const isDst = now.getTimezoneOffset() < dstDate.getTimezoneOffset();

    const estOffset = isDst ? -4 * 60 : -4 * 60;
    const estTime = new Date(now.getTime() + estOffset * 60 * 1000);
    return estTime.toISOString().slice(0, -8);
  };

  useEffect(() => {
    setEndDate(getESTTime());
  }, []);

  useEffect(() => {
    fetchSubmittedTimes();

    if (submitted) {
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
    }
  }, [endDate, submitted]);

  const handleInputChange = (event) => {
    const {name, value} = event.target;
    if (name === 'endDate') {
      setEndDate(value);
    } else if (name === 'succinctDesc') {
      setSuccintDesc(value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    // Create a new Parse object on date-time selection
    const CountdownObject = Parse.Object.extend('Countdown');
    const countdownObject = new CountdownObject();

    const estOffset = -4 * 60; // EST offset in minutes (during dst, during non-dst would be -5)

    const targetDate = new Date(endDate + ':00.000Z');
    targetDate.setMinutes(targetDate.getMinutes() + estOffset);

    countdownObject.set('endDate', targetDate);
    countdownObject.set('succintDesc', succintDesc)
    countdownObject.save().then(
      (response) => {
        console.log("Countdown object created with objectID: ", response.id);
        fetchSubmittedTimes();
      },
      (error) => {
        console.error('Error creating countdown object', error);
      }
    );
  };

  const fetchSubmittedTimes = () => {
    const CountdownObject = Parse.Object.extend('Countdown');
    const query = new Parse.Query(CountdownObject);
    query.ascending('endDate');
    query.find().then(
      (results) => {
        const times = results.map((object) => {
          const utcDate = object.get('endDate');
          const estOffset = new Date().getTimezoneOffset() / 60 + 5
          const estDate = new Date(utcDate);
          estDate.setHours(estDate.getHours() - estOffset);
          return { // adjust to est offset during dst
          objectId: object.id,
          succinctDesc: object.get('succinctDesc'),
          endDate: object.get('endDate').toLocaleString('en-US', {timeZone: 'America/New_York'}),
          }
        });
        
        setSubmittedTimes(times);
      },
      (error) => {
        console.error('Error fetching submitted times', error);
      }
    );
  };


  return (
    <div>
      <h4>Countdown Timer until we get to <b>hug and smush faces!</b></h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='endDate'>Kissy Date:</label>
          <input type="datetime-local" value={endDate} name="endDate" onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="succintDesc">Short Description:</label>
          <input type="text" value={succintDesc} name="succinctDesc" onChange={handleInputChange} />
        </div>
        <div>
        <button type="submit">Add Next Kissy Time</button>
        </div>
      </form>
      <div>
        {countdown.days > 0 && <span>{countdown.days} days </span>}
        {countdown.hours > 0 && <span>{countdown.hours} hours </span>}
        {countdown.minutes > 0 && <span>{countdown.minutes} minutes </span>}
        {countdown.seconds > 0 && <span>{countdown.seconds} seconds </span>}
        {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && (
          <span>Countdown finished!</span>
        )}
      </div>
      <h4>Kissy times already on the books</h4>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {submittedTimes.map((time) => (
            <tr key={time.objectId}>
              <td>{time.succintDesc}</td>
              <td>{time.endDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CountdownTimer;
