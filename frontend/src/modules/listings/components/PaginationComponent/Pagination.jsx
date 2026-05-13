import "./Pagination.css"

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {
    const pages = getPaginationRange(currentPage, totalPages);

    function getPaginationRange(currentPage, totalPages, siblingCount = 1) {
        const totalNumbers = siblingCount * 2 + 5;

        if (totalPages <= totalNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSibling = Math.max(currentPage - siblingCount, 1);
        const rightSibling = Math.min(currentPage + siblingCount, totalPages);

        const showLeftDots = leftSibling > 2;
        const showRightDots = rightSibling < totalPages - 1;

        const pages = [];

        if (!showLeftDots && showRightDots) {
            for (let i = 1; i <= 3 + 2 * siblingCount; i++) {
            pages.push(i);
            }
            pages.push("...");
            pages.push(totalPages);
        } else if (showLeftDots && !showRightDots) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - (3 + 2 * siblingCount) + 1; i <= totalPages; i++) {
            pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push("...");
            for (let i = leftSibling; i <= rightSibling; i++) {
            pages.push(i);
            }
            pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    }

  return (
        <div className="pagination">
      
            {/* Botón anterior */}
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ←
            </button>

            {/* Números */}
            {pages.map((page, index) => {
                if (page === "...") {
                return <span key={index} className="dots">...</span>;
                }

                return (
                <button
                    key={index}
                    className={page === currentPage ? "active" : ""}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
                );
            })}

            {/* Botón siguiente */}
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                →
            </button>
        </div>
    );
}