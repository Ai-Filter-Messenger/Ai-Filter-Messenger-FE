import { createContext, useEffect, ReactNode } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

// 초기 상태
const initialState = {
  themeLayout: "vertical",
  themeStretch: false,

  // Layout
  onToggleLayout: () => {},
  onChangeLayout: () => {},

  // Stretch
  onToggleStretch: () => {},

  // Reset
  onResetSetting: () => {},
};

// Context 생성
const SettingsContext = createContext(initialState);

// Props 타입 정의
interface SettingsProviderProps {
  children: ReactNode;
}

const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useLocalStorage("settings", {
    themeLayout: initialState.themeLayout,
    themeStretch: initialState.themeStretch,
  });

  // Layout
  const onToggleLayout = () => {
    setSettings({
      ...settings,
      themeLayout:
        settings.themeLayout === "vertical" ? "horizontal" : "vertical",
    });
  };

  const onChangeLayout = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      themeLayout: event.target.value,
    });
  };

  // Stretch
  const onToggleStretch = () => {
    setSettings({
      ...settings,
      themeStretch: !settings.themeStretch,
    });
  };

  // Reset Settings
  const onResetSetting = () => {
    setSettings({
      themeLayout: initialState.themeLayout,
      themeStretch: initialState.themeStretch,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,

        // Layout
        onToggleLayout,
        onChangeLayout,

        // Stretch
        onToggleStretch,

        // Reset
        onResetSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };
export default SettingsProvider;
