import { useState, useEffect } from 'react';

interface Breakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  wide: boolean;
}

export const useResponsive = (): Breakpoints => {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>({
    mobile: window.innerWidth < 768,
    tablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    desktop: window.innerWidth >= 1024 && window.innerWidth < 1280,
    wide: window.innerWidth >= 1280
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoints({
        mobile: width < 768,
        tablet: width >= 768 && width < 1024,
        desktop: width >= 1024 && width < 1280,
        wide: width >= 1280
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};
