export default function BoardListView({ items }: { items: any[] }) {
  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Last Name</th>
          <th>ID</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item =>
          <tr key={item.id}>
            <td style={{textAlign: "center"}}>{item.name}</td>
            <td style={{textAlign: "center"}}>{item.lastname ?? ""}</td>
            <td style={{textAlign: "center"}}>{item.id}</td>
            <td>
              {item.checkedIn ? (
                <span className="status checked-in" style={{textAlign: "center"}}>Checked In</span>
              ) : (
                <span className="status not-checked-in" style={{textAlign: "center"}}>Not Checked In</span>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}