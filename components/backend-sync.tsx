"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { loadCatalog } from "@/lib/api";
import { backendEnabled, connectRealtime, restoreSession } from "@/lib/backend";
import { scheduleSync, useStore } from "@/lib/store";

const CATALOG_REFRESH_MS = 60_000;

/**
 * Backend mode only: restores the session, loads the live catalogue and the
 * user's state, and listens for realtime changes. Renders nothing.
 */
export function BackendSync() {
  const session = useStore((s) => s.session);

  useEffect(() => {
    if (!backendEnabled) return;
    const store = useStore.getState();
    let failed = false;
    const refreshCatalog = () =>
      loadCatalog()
        .then(() => {
          failed = false;
          useStore.getState().bumpCatalog();
        })
        .catch(() => {
          // Show the bundled sample data rather than an endless skeleton.
          if (!useStore.getState().catalogVersion)
            useStore.getState().bumpCatalog();
          if (!failed)
            toast.error(
              "Couldn't reach the CollabKaro API. Showing saved data.",
            );
          failed = true;
        });

    void refreshCatalog();
    void restoreSession().then(async (me) => {
      if (!me) return store.setSession("guest");
      store.setSession("authed");
      await useStore.getState().sync();
    });

    const timer = setInterval(refreshCatalog, CATALOG_REFRESH_MS);
    const onFocus = () => {
      void refreshCatalog();
      scheduleSync(0);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!backendEnabled || session !== "authed") return;
    let stop = () => {};
    let closed = false;
    void connectRealtime((event) => {
      scheduleSync(event === "notification:new" ? 0 : 250);
      if (event === "sync")
        void loadCatalog().then(() => useStore.getState().bumpCatalog());
    }).then((disconnect) => {
      if (closed) disconnect();
      else stop = disconnect;
    });
    return () => {
      closed = true;
      stop();
    };
  }, [session]);

  return null;
}
