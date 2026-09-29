// import React, { useState } from "react";

// const FolderCard = ({
//   folder,
//   createFolder,
//   addFile,
//   deleteFolder,
//   deleteFile,
//   onOpenFolder,
//   currentFolderId,
// }) => {
//   const [showSubfolderInput, setShowSubfolderInput] = useState(false);
//   const [subfolderName, setSubfolderName] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);

//   const isCurrentFolder = folder.id === currentFolderId;

//   const handleCreateFolder = () => {
//     if (subfolderName.trim()) {
//       createFolder(folder.id, subfolderName.trim());
//       setSubfolderName("");
//       setShowSubfolderInput(false);
//     }
//   };

//   const handleFileSelect = (e) => {
//     if (e.target.files[0]) setSelectedFile(e.target.files[0]);
//   };

//   const handleUpload = () => {
//     if (selectedFile) {
//       addFile(currentFolderId, selectedFile);
//       setSelectedFile(null);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1 p-4 flex flex-col items-center">
//       <div
//         className="flex flex-col items-center cursor-pointer"
//         onClick={() => onOpenFolder(folder.id)}
//       >
//         <img
//           src="https://img.icons8.com/color/64/000000/folder-invoices.png"
//           alt="folder icon"
//           className="w-16 h-16 mb-2"
//         />
//         <h4 className="text-center font-semibold truncate w-32">
//           {folder.name}
//         </h4>
//         <div className="text-gray-500 text-sm">
//           {folder.createdAt?.toLocaleString()}
//         </div>
//         {folder.subfolders.length > 0 && (
//           <small className="mt-1 text-gray-500">
//             {folder.subfolders.length} subfolder(s)
//           </small>
//         )}
//       </div>

//       {isCurrentFolder && (
//         <div className="mt-4 w-full flex flex-col items-center">
//           <button
//             onClick={() => setShowSubfolderInput(!showSubfolderInput)}
//           >
//             New Folder
//           </button>

//           {showSubfolderInput && (
//             <div className="flex w-full mb-2">
//               <input
//                 type="text"
//                 placeholder="Subfolder Name"
//                 value={subfolderName}
//                 onChange={(e) => setSubfolderName(e.target.value)}
//               />
//               <button
//                 onClick={handleCreateFolder}
//                 className="ml-2"
//               >
//                 Create
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col items-center w-full mb-2">
//             <input type="file" onChange={handleFileSelect} />
//             {selectedFile && (
//               <button onClick={handleUpload}>
//                 Upload
//               </button>
//             )}
//           </div>

//           {folder.id !== 1 && (
//             <button onClick={() => deleteFolder(folder.id)}>
//               Delete Folder
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FolderCard;
