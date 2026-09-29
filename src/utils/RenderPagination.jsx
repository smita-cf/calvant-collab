const RenderPagination = (
  totalItems,
  rowsPerPage,
  currentPage,
  onPageChange,
  handleRowsPerPageChange
) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const handlePrevPage = () => onPageChange(currentPage - 1);
  const handleNextPage = () => onPageChange(currentPage + 1);

  return (
    <div style={{ marginTop: "10px", textAlign: "right" }}>
      <label htmlFor="rows-per-page">Rows per page: </label>
      <select
        id="rows-per-page"
        value={rowsPerPage}
        onChange={handleRowsPerPageChange}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>

      &nbsp;&nbsp;&nbsp;

      <button onClick={handlePrevPage} disabled={currentPage === 0}>
        Previous
      </button>

      <span style={{ margin: "0 10px" }}>
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages - 1}
      >
        Next
      </button>
    </div>
  );
};

export default RenderPagination;
