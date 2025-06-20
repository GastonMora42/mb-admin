import { useState, useEffect } from 'react';

// Hook para detectar el tamaño de pantalla
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({
        width,
        height: window.innerHeight,
      });

      if (width < 640) {
        setBreakpoint('mobile');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else if (width < 1280) {
        setBreakpoint('laptop');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet' || breakpoint === 'sm',
    isLaptop: breakpoint === 'laptop',
    isDesktop: breakpoint === 'desktop',
    windowSize,
    // Helpers
    isMobileOrTablet: ['mobile', 'sm', 'tablet'].includes(breakpoint),
    isLaptopOrDesktop: ['laptop', 'desktop'].includes(breakpoint),
  };
};

// Hook para gestión de sidebar en móviles
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return {
    isOpen,
    toggle,
    close,
    open,
    shouldShow: isMobile ? isOpen : true,
  };
};

// Hook para manejar scroll infinito y paginación
export const useInfiniteScroll = (fetchMore: () => void, hasMore: boolean) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
        return;
      }
      if (hasMore) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!isFetching) return;
    fetchMore();
    setIsFetching(false);
  }, [isFetching, fetchMore]);

  return [isFetching, setIsFetching] as const;
};

// Hook para manejar modales responsive
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle,
    isMobile,
  };
};

// Hook para manejar formularios adaptativos
export const useAdaptiveForm = () => {
  const { isMobile, isTablet } = useBreakpoint();
  
  const getFormLayout = () => {
    if (isMobile) return 'single-column';
    if (isTablet) return 'two-column';
    return 'multi-column';
  };

  const getInputSize = () => {
    if (isMobile) return 'large';
    if (isTablet) return 'medium';
    return 'normal';
  };

  return {
    layout: getFormLayout(),
    inputSize: getInputSize(),
    isMobile,
    isTablet,
    showLabelsInline: !isMobile,
    useFloatingLabels: isMobile,
  };
};

// Hook para orientación de dispositivo
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

// Hook para detección de toque/click
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return { isTouch };
};

// Hook para performance en listas grandes
export const useVirtualization = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { windowSize } = useBreakpoint();

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleStart,
    visibleEnd,
  };
};

// Componente de layout adaptativo
export const AdaptiveContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: string;
  padding?: 'sm' | 'md' | 'lg';
}> = ({ children, maxWidth = '1200px', padding = 'md' }) => {
  const { isMobile, isTablet } = useBreakpoint();

  const getPadding = () => {
    if (isMobile) {
      return padding === 'sm' ? '0.5rem' : padding === 'md' ? '1rem' : '1.5rem';
    }
    if (isTablet) {
      return padding === 'sm' ? '1rem' : padding === 'md' ? '1.5rem' : '2rem';
    }
    return padding === 'sm' ? '1.5rem' : padding === 'md' ? '2rem' : '3rem';
  };

  return (
    <div
      style={{
        maxWidth,
        margin: '0 auto',
        padding: getPadding(),
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

// Componente de grilla adaptativa
export const AdaptiveGrid: React.FC<{
  children: React.ReactNode;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: string;
}> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '1rem'
}) => {
  const { isMobile, isTablet } = useBreakpoint();

  const getColumns = () => {
    if (isMobile) return cols.mobile || 1;
    if (isTablet) return cols.tablet || 2;
    return cols.desktop || 3;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
        gap,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default {
  useBreakpoint,
  useSidebar,
  useInfiniteScroll,
  useModal,
  useAdaptiveForm,
  useOrientation,
  useTouch,
  useVirtualization,
  AdaptiveContainer,
  AdaptiveGrid,
};