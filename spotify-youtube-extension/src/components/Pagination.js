import React from 'react';

const Pagination = ({ currentPage, hasMore, onPreviousPage, onNextPage }) => {
  return (
    <div className="pagination">
      <button 
        onClick={onPreviousPage} 
        className="btn btn-page" 
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="current-page">Page {currentPage}</span>
      <button 
        onClick={onNextPage} 
        className="btn btn-page" 
        disabled={!hasMore}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;