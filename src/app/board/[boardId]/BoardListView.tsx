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
            <td>{item.name}</td>
            <td>{item.lastname ?? ""}</td>
            <td>{item.id}</td>
            <td>
              {item.checkedIn ? (
                <span className="status checked-in">Checked In</span>
              ) : (
                <span className="status not-checked-in">Not Checked In</span>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}