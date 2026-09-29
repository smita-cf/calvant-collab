// import React, { useState } from "react";

// const SearchBar = ({ searchTerm, setSearchTerm, onSearch }) => {
//   const [localTerm, setLocalTerm] = useState(searchTerm || "");

//   const handleSearch = () => {
//     onSearch(localTerm);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   return (
//     <div className="flex mb-2">
//       <input
//         type="text"
//         value={localTerm}
//         onChange={(e) => setLocalTerm(e.target.value)}
//         onKeyPress={handleKeyPress}
//         placeholder="Search documents..."
//         className="border px-2 py-1 rounded flex-1"
//       />
//       <button
//         onClick={handleSearch}
//         className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//       >
//         Search
//       </button>
//     </div>
//   );
// };

// export default SearchBar;
