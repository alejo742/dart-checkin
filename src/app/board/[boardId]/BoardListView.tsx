export default function BoardListView({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return <div>No items to display.</div>;
  }

  // Dynamically compute all columns (except 'checkedIn' and 'uid')
  const columns = Array.from(
    new Set(
      items.flatMap(item => Object.keys(item))
        .filter(key => key !== "checkedIn" && key !== "uid")
    )
  );

  return (
    <table className="board-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col}>{col}</th>
          ))}
          {"checkedIn" in items[0] && <th>Status</th>}
        </tr>
      </thead>
      <tbody>
        {items.map(item =>
          <tr key={item.uid || item.id}>
            {columns.map(col => (
              <td key={col} style={{ textAlign: "center" }}>
                {item[col] ?? ""}
              </td>
            ))}
            {"checkedIn" in item && (
              <td>
                {item.checkedIn ? (
                  <span className="status checked-in" style={{ textAlign: "center" }}>Checked In</span>
                ) : (
                  <span className="status not-checked-in" style={{ textAlign: "center" }}>Not Checked In</span>
                )}
              </td>
            )}
          </tr>
        )}
      </tbody>
    </table>
  );
}