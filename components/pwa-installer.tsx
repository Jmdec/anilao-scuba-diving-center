"use client";

let deferredPrompt: any = null;
let promptAvailable = false; // ← track if event already fired

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    promptAvailable = true;
    window.dispatchEvent(new CustomEvent("pwa-install-available"));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    promptAvailable = false;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}

export function isPWAPromptAvailable() {
  return promptAvailable && !!deferredPrompt;
}

export async function installPWA() {
  if (!deferredPrompt) return;
  try {
    const result = await deferredPrompt.prompt();
    window.dispatchEvent(
      new CustomEvent("pwa-install-result", {
        detail: { outcome: result.outcome },
      }),
    );
    deferredPrompt = null;
    promptAvailable = false;
  } catch (error) {
    console.error("[PWA] Install error:", error);
  }
}
