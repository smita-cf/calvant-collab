// import React from "react";
// import { motion } from "framer-motion";
// import { X } from "lucide-react";

// // ─────────────────────────────────────────────
// // MODAL WRAPPER
// // ─────────────────────────────────────────────
// export function Modal(props) {
//   return (
//     <div
//       onClick={props.onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 50,
//         display: "flex",
//         allignItems: "flex-start",
//         justifyContent: "center",
//         padding: 100,
//         background: "rgba(15,23,42,0.55)",
//         backdropFilter: "blur(4px)",

//       }}
//     >
//       <motion.div
//         onClick={function (e) {
//           e.stopPropagation();
//         }}
//         initial={{ scale: 0.93, y: 30, opacity: 0 }}
//         animate={{ scale: 1, y: 0, opacity: 1 }}
//         transition={{ type: "spring", stiffness: 320, damping: 28 }}
//         style={{
//           background: "#fff",
//           borderRadius: 20,
//           boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
//           width: "100%",
//           maxWidth: props.wide ? 740 : 480,
//           maxHeight: "90vh",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           fontFamily: "'Segoe UI',system-ui,sans-serif",
//         }}
//       >
//         <div style={{ overflowY: "auto", maxHeight: "90vh" }}>
//           {props.children}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// export default Modal;




// import React from "react";
// import { motion } from "framer-motion";
// import { X } from "lucide-react";

// export function Modal(props) {
//   return (
//     <div
//       onClick={props.onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 50,
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "center",
//         padding: 100,
//         background: "rgba(15,23,42,0.55)",
//         backdropFilter: "blur(4px)",
//       }}
//     >
//       <motion.div
//         onClick={function (e) {
//           e.stopPropagation();
//         }}
//         initial={{ scale: 0.93, y: 30, opacity: 0 }}
//         animate={{ scale: 1, y: 0, opacity: 1 }}
//         transition={{ type: "spring", stiffness: 320, damping: 28 }}
//         style={{
//           background: "#fff",
//           borderRadius: 20,
//           boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
//           width: "100%",
//           maxWidth: props.wide ? 740 : 480,
//           maxHeight: "90vh",
//           overflowY: "auto",
//           fontFamily: "'Segoe UI',system-ui,sans-serif",
//         }}
//       >
//         {props.children}
//       </motion.div>
//     </div>
//   );
// }

// export default Modal;




import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal(props) {
  return (
    <div
      onClick={props.onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 100,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <style>{`
        .cv-modal-scroll::-webkit-scrollbar {
          display: none;
        }
        .cv-modal-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <motion.div
        onClick={function (e) {
          e.stopPropagation();
        }}
        initial={{ scale: 0.93, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="cv-modal-scroll"
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: props.wide ? 740 : 480,
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: "'Segoe UI',system-ui,sans-serif",
        }}
      >
        {props.children}
      </motion.div>
    </div>
  );
}

export default Modal;