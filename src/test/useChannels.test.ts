// Teste para o hook useChannels
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChannels } from '../hooks/useChannels';

// Mock do fetch global
global.fetch = vi.fn();

// Mock do m3uParser
vi.mock('../lib/m3uParser', () => ({
  parseM3U: vi.fn()
}));

import { parseM3U } from '../lib/m3uParser';

describe('useChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar canais com sucesso', async () => {
    const mockChannels = [
      {
        id: 'channel_1',
        name: 'Test Channel 1',
        logo: 'http://test.com/logo1.png',
        group: 'Entertainment',
        category: 'General',
        streamUrl: 'http://test.com/stream1.m3u8'
      },
      {
        id: 'channel_2',
        name: 'Test Channel 2',
        logo: 'http://test.com/logo2.png',
        group: 'Sports',
        category: 'Football',
        streamUrl: 'http://test.com/stream2.m3u8'
      }
    ];

    const mockM3UContent = `#EXTM3U
#EXTINF:-1 tvg-logo="http://test.com/logo1.png" group-title="Entertainment" tvg-category="General",Test Channel 1
http://test.com/stream1.m3u8
#EXTINF:-1 tvg-logo="http://test.com/logo2.png" group-title="Sports" tvg-category="Football",Test Channel 2
http://test.com/stream2.m3u8`;

    (fetch as any).mockResolvedValueOnce({
      text: async () => mockM3UContent
    });

    (parseM3U as any).mockReturnValue(mockChannels);

    const { result } = renderHook(() => useChannels());

    // Estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.channels).toEqual([]);

    // Aguardar carregamento
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.channels).toEqual(mockChannels);
    });

    // Verificar chamadas
    expect(fetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/refs/heads/main/data/canaisaovivo.m3u8'
    );
    expect(parseM3U).toHaveBeenCalledWith(mockM3UContent);
  });

  it('deve lidar com erro de fetch', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.channels).toEqual([]);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(parseM3U).not.toHaveBeenCalled();
  });

  it('deve lidar com resposta vazia', async () => {
    (fetch as any).mockResolvedValueOnce({
      text: async () => ''
    });

    (parseM3U as any).mockReturnValue([]);

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.channels).toEqual([]);
    });

    expect(parseM3U).toHaveBeenCalledWith('');
  });

  it('deve lidar com erro no parsing', async () => {
    const mockM3UContent = '#EXTM3U\n#EXTINF:-1,Test Channel\nhttp://test.com/stream.m3u8';

    (fetch as any).mockResolvedValueOnce({
      text: async () => mockM3UContent
    });

    (parseM3U as any).mockImplementation(() => {
      throw new Error('Parse error');
    });

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.channels).toEqual([]);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(parseM3U).toHaveBeenCalledWith(mockM3UContent);
  });

  it('não deve recarregar em re-renders', async () => {
    const mockChannels = [
      {
        id: 'channel_1',
        name: 'Test Channel',
        logo: 'http://test.com/logo.png',
        group: 'Test',
        category: 'Test',
        streamUrl: 'http://test.com/stream.m3u8'
      }
    ];

    (fetch as any).mockResolvedValueOnce({
      text: async () => '#EXTM3U\n#EXTINF:-1,Test Channel\nhttp://test.com/stream.m3u8'
    });

    (parseM3U as any).mockReturnValue(mockChannels);

    const { result, rerender } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.channels).toEqual(mockChannels);
    });

    const fetchCalls = (fetch as any).mock.calls.length;
    const parseCalls = (parseM3U as any).mock.calls.length;

    // Re-render
    rerender();

    // Não deve fazer novas chamadas
    expect((fetch as any).mock.calls.length).toBe(fetchCalls);
    expect((parseM3U as any).mock.calls.length).toBe(parseCalls);
  });
});
