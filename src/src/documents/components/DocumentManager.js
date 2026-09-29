// import React, { useState, useMemo } from "react";
// import FolderCard from "./FolderCard";
// import SearchBar from "./SearchBar";
// import { Breadcrumbs, Typography } from "@material-ui/core";

// const DocumentManager = () => {
//   const [folders, setFolders] = useState([
//     {
//       id: 1,
//       name: "Home",
//       files: [],
//       subfolders: [],
//       parentId: null,
//       createdAt: new Date(),
//     },
//   ]);
//   const [currentFolderId, setCurrentFolderId] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFolderName, setNewFolderName] = useState("");

//   // Find folder by ID recursively
//   const findFolderById = (foldersList, id) => {
//     for (let folder of foldersList) {
//       if (folder.id === id) return folder;
//       const found = findFolderById(folder.subfolders, id);
//       if (found) return found;
//     }
//     return null;
//   };

//   const currentFolder = findFolderById(folders, currentFolderId);

//   // Build breadcrumb path
//   const buildPath = (folder) => {
//     const path = [];
//     let current = folder;
//     while (current) {
//       path.unshift(current);
//       current = findFolderById(folders, current.parentId);
//     }
//     return path;
//   };

//   // Create Folder
//   const createFolder = (parentId, name) => {
//     const addFolder = (foldersList) =>
//       foldersList.map((folder) => {
//         if (folder.id === parentId) {
//           const exists = folder.subfolders.some(
//             (f) => f.name.toLowerCase() === name.toLowerCase()
//           );
//           if (exists) {
//             alert(`Folder "${name}" already exists!`);
//             return folder;
//           }
//           return {
//             ...folder,
//             subfolders: [
//               ...folder.subfolders,
//               {
//                 id: Date.now(),
//                 name,
//                 files: [],
//                 subfolders: [],
//                 parentId,
//                 createdAt: new Date(),
//               },
//             ],
//           };
//         } else if (folder.subfolders.length) {
//           return { ...folder, subfolders: addFolder(folder.subfolders) };
//         }
//         return folder;
//       });
//     setFolders((prev) => addFolder(prev));
//   };

//   // Add File
//   const addFile = (folderId, file) => {
//     const addFileToFolder = (foldersList) =>
//       foldersList.map((folder) => {
//         if (folder.id === folderId) {
//           const exists = folder.files.some((f) => f.file.name === file.name);
//           if (exists) {
//             alert(`File "${file.name}" already exists!`);
//             return folder;
//           }
//           return {
//             ...folder,
//             files: [...folder.files, { file, createdAt: new Date() }],
//           };
//         } else if (folder.subfolders.length) {
//           return { ...folder, subfolders: addFileToFolder(folder.subfolders) };
//         }
//         return folder;
//       });
//     setFolders((prev) => addFileToFolder(prev));
//   };

//   // Delete Folder
//   const deleteFolder = (folderId) => {
//     if (folderId === 1) {
//       alert("Home folder cannot be deleted!");
//       return;
//     }
//     const removeFolder = (foldersList) =>
//       foldersList
//         .filter((f) => f.id !== folderId)
//         .map((f) => ({ ...f, subfolders: removeFolder(f.subfolders) }));
//     setFolders((prev) => removeFolder(prev));
//     if (currentFolderId === folderId) setCurrentFolderId(1);
//   };

//   // Delete File
//   const deleteFile = (folderId, fileName) => {
//     const removeFile = (foldersList) =>
//       foldersList.map((folder) => {
//         if (folder.id === folderId) {
//           return {
//             ...folder,
//             files: folder.files.filter((f) => f.file.name !== fileName),
//           };
//         } else if (folder.subfolders.length) {
//           return { ...folder, subfolders: removeFile(folder.subfolders) };
//         }
//         return folder;
//       });
//     setFolders((prev) => removeFile(prev));
//   };

//   const goBack = () => {
//     if (currentFolder.parentId) setCurrentFolderId(currentFolder.parentId);
//   };

//   const handleCreateFolder = () => {
//     if (!newFolderName.trim()) return;
//     createFolder(currentFolderId, newFolderName.trim());
//     setNewFolderName("");
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) addFile(currentFolderId, file);
//     e.target.value = null;
//   };

//   const handleSearch = (term) => {
//     setSearchTerm(term);
//   };

//   const filteredSubfolders = useMemo(
//     () =>
//       currentFolder?.subfolders.filter((f) =>
//         f.name.toLowerCase().includes(searchTerm.toLowerCase())
//       ) || [],
//     [currentFolder, searchTerm]
//   );

//   const filteredFiles = useMemo(
//     () =>
//       currentFolder?.files.filter((fObj) =>
//         fObj.file.name.toLowerCase().includes(searchTerm.toLowerCase())
//       ) || [],
//     [currentFolder, searchTerm]
//   );

//   return (
//     <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
//       {/* Header */}
//       <div className="p-6 shadow z-10 flex-shrink-0">
//         <h1 className="text-3xl font-bold mb-4 text-gray-800">
//           Document Repository
//         </h1>

//         <Breadcrumbs aria-label="breadcrumb" className="mb-4">
//           {buildPath(currentFolder).map((folder, idx) => (
//             <Typography
//               key={folder.id}
//               className={`cursor-pointer hover:underline ${
//                 idx === buildPath(currentFolder).length - 1
//                   ? "font-bold text-blue-700"
//                   : "text-gray-600"
//               }`}
//               onClick={() => setCurrentFolderId(folder.id)}
//             >
//               {folder.name}
//             </Typography>
//           ))}
//         </Breadcrumbs>

//         {/* Actions row */}
//         {/* Actions row */}
//         <div className="mb-4 flex items-center justify-between gap-4">
//           {/* Left section: Search + New Folder + Create + Choose */}
//           <div >
//             {/* Search */}
//             <SearchBar
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//               onSearch={handleSearch}
//             />

//             {/* New Folder Name */}
//             <input
//               type="text"
//               placeholder="New Folder Name"
//               value={newFolderName}
//               onChange={(e) => setNewFolderName(e.target.value)}
//             />

//             {/* Create Folder */}
//             <button onClick={handleCreateFolder}>Create Folder</button>


//             {/* Choose File */}
//             <input type="file" onChange={handleFileUpload} />
//           </div>

//           {/* Back */}
//           {currentFolder.parentId && <button onClick={goBack}>← Back</button>}
//         </div>
//       </div>

//       {/* Scrollable content */}
//       <div className="flex-1 overflow-y-auto p-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {filteredSubfolders.map((folder) => (
//             <FolderCard
//               key={folder.id}
//               folder={folder}
//               createFolder={createFolder}
//               addFile={addFile}
//               deleteFolder={deleteFolder}
//               deleteFile={deleteFile}
//               onOpenFolder={setCurrentFolderId}
//               currentFolderId={currentFolderId}
//             />
//           ))}

//           {filteredFiles.map((fObj, idx) => (
//             <div
//               key={idx}
//               className="border rounded-lg p-4 flex flex-col items-center justify-between bg-white shadow hover:shadow-xl transition"
//             >
//               <div className="text-center truncate font-medium text-gray-700">
//                 {fObj.file.name}
//               </div>
//               <div className="text-gray-500 text-sm">
//                 {fObj.createdAt.toLocaleString()}
//               </div>
//               <div className="flex space-x-2 mt-2">
//                 <a
//                   href={URL.createObjectURL(fObj.file)}
//                   download
//                   className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition text-sm"
//                 >
//                   Download
//                 </a>
//                 <button
//                   onClick={() => deleteFile(currentFolderId, fObj.file.name)}
//                   className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentManager;
