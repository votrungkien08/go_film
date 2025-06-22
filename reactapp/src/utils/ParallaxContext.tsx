import { createContext, useContext, useState } from 'react';

const ParallaxContext = createContext<{ parallaxBg: string | null; setParallaxBg: (bg: string | null) => void }>({
  parallaxBg: null,
  setParallaxBg: () => {},
});

export const ParallaxProvider = ({ children }: { children: React.ReactNode }) => {
  const [parallaxBg, setParallaxBg] = useState<string | null>(null);

  return <ParallaxContext.Provider value={{ parallaxBg, setParallaxBg }}>{children}</ParallaxContext.Provider>;
};

export const useParallax = () => useContext(ParallaxContext);