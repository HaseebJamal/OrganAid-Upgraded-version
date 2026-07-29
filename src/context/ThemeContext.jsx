import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "organaid-theme";

export const THEMES = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
});

const VALID_THEMES = new Set(
  Object.values(THEMES)
);

function isBrowser() {
  return typeof window !== "undefined";
}

function isValidTheme(theme) {
  return VALID_THEMES.has(theme);
}

function getSystemTheme() {
  if (!isBrowser()) {
    return THEMES.LIGHT;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

function getStoredTheme() {
  if (!isBrowser()) {
    return THEMES.SYSTEM;
  }

  try {
    const savedTheme =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    return isValidTheme(savedTheme)
      ? savedTheme
      : THEMES.SYSTEM;
  } catch (error) {
    console.warn(
      "Unable to read the saved OrganAid theme:",
      error
    );

    return THEMES.SYSTEM;
  }
}

function saveTheme(theme) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      theme
    );
  } catch (error) {
    console.warn(
      "Unable to save the OrganAid theme:",
      error
    );
  }
}

function applyThemeToDocument(theme) {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  const root =
    document.documentElement;

  root.dataset.theme = theme;

  root.classList.toggle(
    "dark",
    theme === THEMES.DARK
  );

  root.classList.toggle(
    "light",
    theme === THEMES.LIGHT
  );

  root.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
}) {
  const [theme, setThemeState] =
    useState(getStoredTheme);

  const [
    systemTheme,
    setSystemTheme,
  ] = useState(getSystemTheme);

  const resolvedTheme =
    theme === THEMES.SYSTEM
      ? systemTheme
      : theme;

  const setTheme = useCallback(
    (nextTheme) => {
      setThemeState((currentTheme) => {
        const resolvedValue =
          typeof nextTheme ===
          "function"
            ? nextTheme(
                currentTheme
              )
            : nextTheme;

        if (
          !isValidTheme(
            resolvedValue
          )
        ) {
          console.warn(
            `Invalid theme "${resolvedValue}". Expected "light", "dark", or "system".`
          );

          return currentTheme;
        }

        return resolvedValue;
      });
    },
    []
  );

  const toggleTheme =
    useCallback(() => {
      setThemeState(
        (currentTheme) => {
          const currentResolvedTheme =
            currentTheme ===
            THEMES.SYSTEM
              ? getSystemTheme()
              : currentTheme;

          return currentResolvedTheme ===
            THEMES.DARK
            ? THEMES.LIGHT
            : THEMES.DARK;
        }
      );
    }, []);

  const useSystemTheme =
    useCallback(() => {
      setThemeState(
        THEMES.SYSTEM
      );
    }, []);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyThemeToDocument(
      resolvedTheme
    );
  }, [resolvedTheme]);

  useEffect(() => {
    if (!isBrowser()) {
      return undefined;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    function handleSystemThemeChange(
      event
    ) {
      setSystemTheme(
        event.matches
          ? THEMES.DARK
          : THEMES.LIGHT
      );
    }

    setSystemTheme(
      mediaQuery.matches
        ? THEMES.DARK
        : THEMES.LIGHT
    );

    if (
      typeof mediaQuery.addEventListener ===
      "function"
    ) {
      mediaQuery.addEventListener(
        "change",
        handleSystemThemeChange
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleSystemThemeChange
        );
      };
    }

    /*
     * Compatibility fallback for
     * older Safari versions.
     */
    mediaQuery.addListener(
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeListener(
        handleSystemThemeChange
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,

      setTheme,
      toggleTheme,
      useSystemTheme,

      isDark:
        resolvedTheme ===
        THEMES.DARK,

      isLight:
        resolvedTheme ===
        THEMES.LIGHT,

      isSystem:
        theme === THEMES.SYSTEM,

      themes: THEMES,
    }),
    [
      theme,
      resolvedTheme,
      systemTheme,
      setTheme,
      toggleTheme,
      useSystemTheme,
    ]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider."
    );
  }

  return context;
}