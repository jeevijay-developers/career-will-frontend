"use client";

import { useEffect } from "react";
import { syncBatches } from "../server/server.js";

export function AppInitializer() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Syncing batches on app initialization...");
        await syncBatches();
        console.log("Batches synced successfully");
      } catch (error) {
        console.error("Failed to sync batches on app initialization:", error);
        // Don't show error toast on app load to avoid disrupting user experience
      }
    };

    initializeApp();
  }, []);

  // This component doesn't render anything
  return null;
}
