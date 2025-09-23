import { createContext, useContext, useState } from "react";

interface AppContextType {
  uri: string;
  setUri: (uri: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider(props: Readonly<{ children: React.ReactNode }>) {

  const [uri, setUri] = useState('');

  return (
    <AppContext.Provider value={{ uri, setUri }}>
      {props.children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
}