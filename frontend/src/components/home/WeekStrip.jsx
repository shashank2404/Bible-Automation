// src/components/home/WeekStrip.jsx

const style = `
  .week-strip {
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
  }

  .day-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
  }

  .day-name {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 1px;
    color: #7A6A52;
    text-transform: uppercase;
  }

  .day-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid #2A2318;
    background: #1E1A16;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', serif;
    font-size: 13px;
    font-weight: 600;
    color: #7A6A52;
    position: relative;
  }

  .day-circle.past {
    border-color: #2A2318;
    color: #5A4A32;
  }

  .day-circle.today {
    border-color: #E8A838;
    background: transparent;
    color: #E8A838;
    box-shadow: 0 0 12px rgba(232,168,56,0.2);
  }

  .day-circle.today::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: conic-gradient(#E8A838 75%, transparent 75%) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }

  .day-circle.future {
    border-color: #252018;
    color: #4A3A2A;
  }
`;

const days = [
  { name: "M", num: 30, type: "past" },
  { name: "T", num: 31, type: "past" },
  { name: "W", num: 1,  type: "today" },
  { name: "T", num: 2,  type: "future" },
  { name: "F", num: 3,  type: "future" },
  { name: "S", num: 4,  type: "future" },
  { name: "S", num: 5,  type: "future" },
];

export default function WeekStrip() {
  return (
    <>
      <style>{style}</style>
      <div className="week-strip">
        {days.map((d, i) => (
          <div className="day-item" key={i}>
            <span className="day-name">{d.name}</span>
            <div className={`day-circle ${d.type}`}>{d.num}</div>
          </div>
        ))}
      </div>
    </>
  );
}
