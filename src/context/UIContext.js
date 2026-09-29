"use client"
import React, { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // Drives the new left-hand Help panel (Help Center / Support and Tickets).
  // Kept separate from the legacy `showHelp` doc-modal state above so existing
  // per-module <HelpDocModal open={showHelp} /> usages are unaffected.
  const [helpNavOpen, setHelpNavOpen] = useState(false);

  const startTutorial = () => {
    setRunTour(false);
    // Small timeout ensures the state toggle registers if a tour was already active
    setTimeout(() => setRunTour(true), 100);
  };

  const openHelp = () => {
    setShowHelp(true);
  };

  const openHelpNav = () => {
    setHelpNavOpen(true);
  };

  const closeHelpNav = () => {
    setHelpNavOpen(false);
  };

  return (
    <UIContext.Provider
      value={{
        runTour,
        setRunTour,
        startTutorial,
        showHelp,
        setShowHelp,
        openHelp,
        helpNavOpen,
        setHelpNavOpen,
        openHelpNav,
        closeHelpNav,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
