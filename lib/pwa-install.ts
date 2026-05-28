"use client";

let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent("pwa-install-available"));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}

export function isPWAPromptAvailable(): boolean {
  return !!deferredPrompt;
}

export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    const result = await deferredPrompt.prompt();
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
    return result.outcome === "accepted";
  } catch (error) {
    console.error("[PWA] Install error:", error);
    return false;
  }
}
