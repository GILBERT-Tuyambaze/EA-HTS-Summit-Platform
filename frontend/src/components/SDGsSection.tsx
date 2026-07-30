const sdgItems = [
  { number: '01', title: 'No Poverty', color: '#e5243b' },
  { number: '02', title: 'Zero Hunger', color: '#dda63a' },
  { number: '03', title: 'Good Health & Well-being', color: '#4c9f38' },
  { number: '04', title: 'Quality Education', color: '#c5192d' },
  { number: '05', title: 'Gender Equality', color: '#ff3a21' },
  { number: '07', title: 'Affordable & Clean Energy', color: '#fcc30b', textColor: '#0f172a' },
  { number: '09', title: 'Industry, Innovation & Infrastructure', color: '#fd6925' },
  { number: '11', title: 'Sustainable Cities', color: '#fd9d24' },
  { number: '13', title: 'Climate Action', color: '#3f7e44' },
  { number: '17', title: 'Partnerships for the Goals', color: '#19486a' },
];

const SDGsSection = () => (
  <section className="section sdgs-section" id="sdgs">
    <div className="container">
      <div className="section-header centered reveal">
        <div className="eyebrow">GLOBAL ALIGNMENT</div>
        <h2>Advancing the UN Sustainable Development Goals.</h2>
        <p>The Summit directly contributes to ten SDGs through technology-driven humanitarian solutions.</p>
      </div>

      <div className="sdg-grid reveal">
        {sdgItems.map((item) => (
          <div key={item.number} className="sdg-card" style={{ backgroundColor: item.color, color: item.textColor ?? '#ffffff' }}>
            <div className="sdg-num">{item.number}</div>
            <div className="sdg-text">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SDGsSection;
