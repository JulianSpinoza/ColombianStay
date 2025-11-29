import React, { useState, useRef, useEffect } from "react";

const CategoryBar = () => {
  const [selectedCategory, setSelectedCategory] = useState("Cabins");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  const categories = [
    { id: 1, name: "Cabins", icon: "🏕️" },
    { id: 2, name: "Beach", icon: "🏖️" },
    { id: 3, name: "Design", icon: "🎨" },
    { id: 4, name: "Mountains", icon: "⛰️" },
    { id: 5, name: "City", icon: "🏙️" },
    { id: 6, name: "Gardens", icon: "🌿" },
    { id: 7, name: "Pools", icon: "🏊" },
    { id: 8, name: "Luxe", icon: "✨" },
    { id: 9, name: "Rooms", icon: "🛏️" },
    { id: 10, name: "Farms", icon: "🌾" },
    { id: 11, name: "Arctic", icon: "❄️" },
    { id: 12, name: "Castles", icon: "🏰" },
  ];

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full flex justify-center items-center">
          {/* Left Arrow (inline so the whole block centers) */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="z-20 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow mr-3"
              aria-label="Scroll left"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Categories Container (centered, constrained width) */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-8 py-4 scroll-smooth scrollbar-hide max-w-4xl"
            style={{ scrollBehavior: "smooth" }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex flex-col items-center gap-2 pb-3 whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.name
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "border-b-2 border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="z-20 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow ml-3"
              aria-label="Scroll right"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryBar;
