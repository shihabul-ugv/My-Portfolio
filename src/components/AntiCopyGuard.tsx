"use client";

import { useEffect } from "react";

export function AntiCopyGuard() {
  useEffect(() => {
    // 1. Disable image dragging (prevents dragging images into AI windows or folders)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "IMG" || target.tagName === "PICTURE" || target.closest("img"))) {
        e.preventDefault();
        return false;
      }
    };

    // 2. Disable right-click on images, canvas, and project cards
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "IMG" ||
          target.tagName === "CANVAS" ||
          target.closest("img") ||
          target.closest("[data-protect='true']") ||
          target.closest(".project-card"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Prevent page source viewing / saving shortcuts (Ctrl+S, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      // Ctrl+S / Cmd+S (Save webpage)
      if (isCtrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return false;
      }
      // Ctrl+U / Cmd+U (View HTML source)
      if (isCtrlOrCmd && e.key.toLowerCase() === "u") {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
