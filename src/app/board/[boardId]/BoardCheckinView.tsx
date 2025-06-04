export default function BoardCheckinView({ items }: { items: any[] }) {
  return (
    <div className="board-checkin-view">
      {items.map(item =>
        <div
          key={item.id}
          className={`checkin-card${item.checkedIn ? " checked-in" : ""}`}
        >
          <div className="checkin-name">{item.name}</div>
          <div className="checkin-status">
            {item.checkedIn ? "Checked In" : "Not Checked In"}
          </div>
        </div>
      )}
    </div>
  );
}