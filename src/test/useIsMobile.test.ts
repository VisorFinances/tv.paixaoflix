// Teste para o hook useIsMobile
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../hooks/useIsMobile';

// Mock do window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock do window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetar window.innerWidth para valor padrão
    window.innerWidth = 1024;
  });

  it('deve retornar false em desktop', () => {
    window.innerWidth = 1024;
    
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('deve retornar true em mobile', () => {
    window.innerWidth = 500;
    
    const mockMediaQueryList = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('deve adicionar e remover event listener', () => {
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { unmount } = renderHook(() => useIsMobile());

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('deve atualizar quando a tela muda de tamanho', () => {
    window.innerWidth = 1024;
    
    let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;
    
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback as ((event: MediaQueryListEvent) => void);
        }
      }),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simular mudança para mobile
    window.innerWidth = 500;
    
    act(() => {
      if (changeCallback) {
        changeCallback({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });

  it('deve lidar com undefined inicial corretamente', () => {
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useIsMobile());

    // Hook deve sempre retornar boolean (não undefined)
    expect(typeof result.current).toBe('boolean');
    expect(result.current).toBe(false);
  });
});
