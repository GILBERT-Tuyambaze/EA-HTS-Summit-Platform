import { DemoCard as DemoCardType } from '../types';

const DemoCard = ({ card }: { card: DemoCardType }) => (
  <div className={`demo-card reveal${card.className ? ` ${card.className}` : ''}`}>
    <div className="demo-card-img">
      <img src={card.image} alt={card.alt} loading="lazy" />
      <div className="demo-card-badge">{card.badge}</div>
    </div>
    <div className="demo-card-body">
      <h3>{card.title}</h3>
      <p>{card.description}</p>
      <div className="demo-card-topics">
        {card.topics.map((topic) => (
          <span key={topic} className="demo-topic">
            {topic}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default DemoCard;
