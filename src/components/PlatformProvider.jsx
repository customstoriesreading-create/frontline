import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { detectPlatform } from '@/lib/platform';

const PlatformContext = createContext('ios');

export const usePlatform = () => useContext(PlatformContext);

export default function PlatformProvider({ children }) {
  const location = useLocation();
  const [platform, setPlatform] = useState(detectPlatform);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, [location.search]);

  useEffect(() => {
    document.documentElement.setAttribute('data-platform', platform);
  }, [platform]);

  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}