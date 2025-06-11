// BoardFilters.tsx
export default function BoardFilters({
  search, filter, onSearch, onFilter
}: {
  search: string, filter: string, onSearch: (s: string) => void, onFilter: (f: string) => void
}) {
  return (
    <div className="board-filters">
      <input
        className="board-search focus"
        type="text"
        placeholder="Search, write now..."
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
      <select
        className="board-filter-select"
        value={filter}
        onChange={e => onFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="checkedin">Checked In</option>
        <option value="notcheckedin">Not Checked In</option>
      </select>
    </div>
  );
}