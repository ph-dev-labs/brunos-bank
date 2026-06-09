"use client";

import { useState, useEffect, useRef } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "zh-CN", name: "中文(简体)", flag: "🇨🇳" },
  { code: "zh-TW", name: "中文(繁體)", flag: "🇹🇼" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", flag: "🇳🇬" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const filtered = languages.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const changeLanguage = (langCode: string, langName: string) => {
    setCurrentLang(langName);
    setIsOpen(false);
    setSearch("");

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
  };

  const currentFlag = languages.find((l) => l.name === currentLang)?.flag ?? "🌐";

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        aria-label="Select Language"
      >
        <span className="text-base">{currentFlag}</span>
        <span className="hidden sm:inline">{currentLang}</span>
        <span className="material-symbols-outlined text-[1rem] opacity-50">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-dark-600">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 text-white text-sm placeholder:text-gray-500 rounded-lg px-3 py-1.5 outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          {/* List */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin py-1">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 text-xs py-4">No results</p>
            ) : (
              filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code, lang.name)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700 transition-colors flex items-center gap-2.5"
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 truncate">{lang.name}</span>
                  {currentLang === lang.name && (
                    <span className="material-symbols-outlined text-[1rem] text-primary-400">check</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

