"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Don't load if already loaded
    if (document.getElementById("gt-script")) return;

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", layout: 0, autoDisplay: false },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "gt-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Hidden element that Google Translate takes over
  return (
    <div
      id="google_translate_element"
      style={{ position: "absolute", visibility: "hidden", height: 0, overflow: "hidden" }}
    />
  );
}
