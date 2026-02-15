// Parser de arquivos M3U para canais de TV
import { Channel } from '@/types';

export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split('\n');
  let currentChannel: Partial<Channel> = {};
  let channelId = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Linha de informação do canal
    if (trimmedLine.startsWith('#EXTINF:')) {
      const parts = trimmedLine.split(',');
      const name = parts[1] || '';
      
      // Extrair informações usando regex
      const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
      const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
      const categoryMatch = trimmedLine.match(/tvg-category="([^"]+)"/);
      const idMatch = trimmedLine.match(/tvg-id="([^"]+)"/);
      const countryMatch = trimmedLine.match(/tvg-country="([^"]+)"/);
      const languageMatch = trimmedLine.match(/tvg-language="([^"]+)"/);
      
      currentChannel = {
        id: idMatch?.[1] || `channel_${channelId++}`,
        name: name.trim(),
        logo: logoMatch?.[1] || '',
        group: groupMatch?.[1] || 'Sem Categoria',
        category: categoryMatch?.[1] || 'Geral',
      };
    }
    // Linha de URL do stream
    else if (trimmedLine && !trimmedLine.startsWith('#') && currentChannel.name) {
      currentChannel.streamUrl = trimmedLine;
      
      // Validação e adição do canal
      if (currentChannel.name && currentChannel.streamUrl) {
        channels.push({
          id: currentChannel.id || `channel_${channelId}`,
          name: currentChannel.name,
          logo: currentChannel.logo || '',
          group: currentChannel.group || 'Sem Categoria',
          category: currentChannel.category || 'Geral',
          streamUrl: currentChannel.streamUrl
        });
      }
      
      currentChannel = {};
    }
  }

  return channels;
}

export function parseM3UWithMetadata(content: string): { channels: Channel[], metadata: any } {
  const channels = parseM3U(content);
  const lines = content.split('\n');
  
  // Extrair metadados do arquivo
  const metadata = {
    totalChannels: channels.length,
    groups: [...new Set(channels.map(ch => ch.group))],
    categories: [...new Set(channels.map(ch => ch.category))],
    hasLogos: channels.some(ch => ch.logo),
    parsedAt: new Date().toISOString(),
    fileFormat: detectM3UFormat(lines)
  };

  return { channels, metadata };
}

function detectM3UFormat(lines: string[]): string {
  const firstLine = lines[0]?.trim();
  
  if (firstLine === '#EXTM3U') return 'standard';
  if (firstLine?.startsWith('#EXTM3U')) return 'extended';
  return 'unknown';
}

export function filterChannels(channels: Channel[], filters: {
  group?: string;
  category?: string;
  search?: string;
}): Channel[] {
  return channels.filter(channel => {
    if (filters.group && channel.group !== filters.group) return false;
    if (filters.category && channel.category !== filters.category) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return channel.name.toLowerCase().includes(searchLower) ||
             channel.group.toLowerCase().includes(searchLower) ||
             channel.category.toLowerCase().includes(searchLower);
    }
    return true;
  });
}

export function sortChannels(channels: Channel[], sortBy: 'name' | 'group' | 'category'): Channel[] {
  return [...channels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'group':
        return a.group.localeCompare(b.group);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
}

export function validateM3UContent(content: string): { isValid: boolean, errors: string[] } {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('Arquivo M3U está vazio');
    return { isValid: false, errors };
  }
  
  const lines = content.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (!firstLine?.startsWith('#EXTM3U')) {
    errors.push('Arquivo não começa com #EXTM3U');
  }
  
  let extinfCount = 0;
  let urlCount = 0;
  
  for (const line of lines) {
    if (line.trim().startsWith('#EXTINF:')) {
      extinfCount++;
    } else if (line.trim() && !line.trim().startsWith('#')) {
      urlCount++;
    }
  }
  
  if (extinfCount !== urlCount) {
    errors.push(`Número de linhas #EXTINF (${extinfCount}) não corresponde ao número de URLs (${urlCount})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
