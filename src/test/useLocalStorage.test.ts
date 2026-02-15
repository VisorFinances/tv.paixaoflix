// Teste para o hook useLocalStorage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve usar valor inicial quando localStorage está vazio', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    expect(result.current[0]).toBe('initial-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('deve carregar valor do localStorage', () => {
    const storedValue = JSON.stringify('stored-value');
    localStorageMock.getItem.mockReturnValue(storedValue);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    expect(result.current[0]).toBe('stored-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('deve salvar valor no localStorage quando mudar', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('deve lidar com função de atualização', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('old-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    act(() => {
      result.current[1]((prev) => prev + '-updated');
    });

    expect(result.current[0]).toBe('old-value-updated');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('old-value-updated'));
  });

  it('deve lidar com objetos complexos', () => {
    const initialObject = { name: 'Test', count: 0 };
    const storedObject = { name: 'Stored', count: 5 };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedObject));

    const { result } = renderHook(() => useLocalStorage('test-key', initialObject));

    expect(result.current[0]).toEqual(storedObject);

    act(() => {
      result.current[1]({ ...storedObject, count: 10 });
    });

    expect(result.current[0]).toEqual({ name: 'Stored', count: 10 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ name: 'Stored', count: 10 }));
  });

  it('deve lidar com arrays', () => {
    const initialArray = [1, 2, 3];
    const storedArray = [4, 5, 6];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedArray));

    const { result } = renderHook(() => useLocalStorage('test-key', initialArray));

    expect(result.current[0]).toEqual(storedArray);

    act(() => {
      result.current[1]([...storedArray, 7]);
    });

    expect(result.current[0]).toEqual([4, 5, 6, 7]);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify([4, 5, 6, 7]));
  });

  it('deve lidar com JSON inválido no localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    expect(result.current[0]).toBe('initial-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('deve lidar com erro ao salvar no localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(consoleSpy).toHaveBeenCalledWith('Error saving to localStorage', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('deve lidar com erro ao carregar do localStorage', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Access denied');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    expect(result.current[0]).toBe('initial-value');
  });

  it('deve atualizar localStorage quando a chave mudar', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'initial-value'),
      { initialProps: { key: 'test-key' } }
    );

    act(() => {
      result.current[1]('value-1');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('value-1'));

    // Mudar a chave
    rerender({ key: 'new-key' });

    act(() => {
      result.current[1]('value-2');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('new-key', JSON.stringify('value-2'));
  });

  it('deve funcionar com valores booleanos', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(true));

    const { result } = renderHook(() => useLocalStorage('test-key', false));

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(false));
  });

  it('deve funcionar com valores null', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(null));

    const { result } = renderHook(() => useLocalStorage('test-key', null as string | null));

    expect(result.current[0]).toBe(null);

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe(null);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(null));
  });
});
