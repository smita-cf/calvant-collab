import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { helpMarkdownComponents } from "./markdownComponents";

// Renders <a> tags from markdown. If the href is "doc:some-id", it intercepts
// the click and asks the modal to navigate to that doc instead of following
// it as a normal link. Anything else falls back to your existing styled link
// (or a plain external link if none was defined).
const DocAwareLink = ({ href, children, onNavigate, ...rest }) => {
  if (href && href.startsWith("doc:")) {
    const targetId = href.slice(4);
    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("navigating to:", targetId);
          onNavigate(targetId);
        }}
        className="text-blue-600 font-medium hover:underline cursor-pointer"
      >
        {children}
      </a>
    );
  }

  const OriginalA = helpMarkdownComponents?.a;
  if (OriginalA) {
    return (
      <OriginalA href={href} {...rest}>
        {children}
      </OriginalA>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" {...rest}>
      {children}
    </a>
  );
};

/**
 * HelpDocModal
 *
 * Two ways to use it:
 *
 * 1) Registry mode (new — supports doc: links and back navigation):
 *    <HelpDocModal open={open} onClose={close} docs={INTRO_DOCS} initialDocId="intro" />
 *
 * 2) Legacy single-string mode (still works, no navigation):
 *    <HelpDocModal open={open} onClose={close} title="Home Dashboard Help" content={someString} />
 */
const HelpDocModal = ({
  open,
  onClose,
  title = "Help",
  content,
  docs,
  initialDocId = "intro",
}) => {
  const [stack, setStack] = useState([initialDocId]);
  const bodyRef = useRef(null);

  // Reset to the starting doc every time the modal is (re)opened.
  useEffect(() => {
    if (open) setStack([initialDocId]);
  }, [open, initialDocId]);

  // Scroll back to top whenever the visible doc changes.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [stack]);

  const currentId = stack[stack.length - 1];
  const isRegistryMode = !!docs;
  const currentDoc = isRegistryMode
    ? docs[currentId] || { title: "Not Found", content: `_This help page ("${currentId}") doesn't exist yet._` }
    : { title, content };

  const pushDoc = (id) => setStack((prev) => [...prev, id]);
  const goBack = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const components = {
    ...helpMarkdownComponents,
    a: (props) => <DocAwareLink {...props} onNavigate={pushDoc} />,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 bg-slate-900/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 min-w-0">
                {stack.length > 1 ? (
                  <button
                    onClick={goBack}
                    className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-200 transition-colors flex-shrink-0"
                    title="Back"
                  >
                    <ArrowLeft size={16} className="text-slate-500" />
                  </button>
                ) : (
                  <BookOpen size={18} className="text-blue-500 flex-shrink-0" />
                )}
                <h3 className="text-base font-semibold text-slate-800 truncate">
                  {currentDoc.title || title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors flex-shrink-0"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div ref={bodyRef} className="overflow-y-auto px-6 py-5 prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
                urlTransform={(url) => (url.startsWith("doc:") ? url : defaultUrlTransform(url))}
              >
                {currentDoc.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpDocModal;