import { CountdownValue } from '../types';

const Countdown = ({ countdown }: { countdown: CountdownValue }) => (
  <div className="countdown-card">
    <div className="countdown-label">Summit begins in</div>
    <div className="countdown-grid">
      <div className="countdown-unit">
        <div className="countdown-number" id="cd-days">{countdown.days}</div>
        <div className="countdown-text">Days</div>
      </div>
      <div className="countdown-unit">
        <div className="countdown-number" id="cd-hours">{countdown.hours}</div>
        <div className="countdown-text">Hours</div>
      </div>
      <div className="countdown-unit">
        <div className="countdown-number" id="cd-mins">{countdown.mins}</div>
        <div className="countdown-text">Mins</div>
      </div>
      <div className="countdown-unit">
        <div className="countdown-number" id="cd-secs">{countdown.secs}</div>
        <div className="countdown-text">Secs</div>
      </div>
    </div>
  </div>
);

export default Countdown;
