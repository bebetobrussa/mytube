import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'mytube_store.json');

// Interfaces
export interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  description?: string;
}

export interface ChannelItem {
  channelId: string;
  name: string;
  thumbnail: string;
  customUrl?: string;
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  adminPassword?: string;
}

export interface I18nLocale {
  code: string;
  label: string;
}

export interface I18nConfig {
  defaultLocale: string;
  locales: I18nLocale[];
  strings: Record<string, Record<string, string>>;
}

export interface StoreData {
  settings: AppSettings;
  channels: ChannelItem[];
  i18n: I18nConfig;
}

// Initial default configuration exactly aligned with Projeto MyTube
const DEFAULT_STRINGS_PT_BR: Record<string, string> = {
  'nav.discovery': 'Início',
  'nav.channels': 'Canais',
  'nav.history': 'Histórico',
  'nav.admin': 'Admin',
  'empty.noVideos': 'Nenhum vídeo ainda. Adicione canais no Admin para começar.',
  'empty.noChannelsPublic': 'Nenhum canal cadastrado ainda. Vá em Admin para adicionar.',
  'empty.noChannelVideos': 'Nenhum vídeo encontrado para este canal.',
  'empty.noHistory': 'Você ainda não assistiu nenhum vídeo.',
  'empty.videoNotFound': 'Vídeo não encontrado.',
  'empty.noChannelsAdmin': 'Nenhum canal cadastrado.',
  'common.loading': 'Carregando…',
  'common.error': 'Erro ao carregar: ',
  'common.save': 'Salvar',
  'common.remove': 'Remover',
  'channel.fallbackName': 'Canal',
  'history.clearButton': 'Limpar histórico',
  'history.watchedPrefix': 'Assistido',
  'admin.loginTitle': 'Login administrativo',
  'admin.passwordLabel': 'Senha',
  'admin.loginButton': 'Entrar',
  'admin.addChannelLabel': 'Adicionar canal (URL, @handle ou channelId)',
  'admin.addChannelPlaceholder': 'https://youtube.com/@canal',
  'admin.personalizationTitle': 'Personalização',
  'admin.appNameLabel': 'Nome do app',
  'admin.logoUrlLabel': 'URL do logo',
  'admin.primaryColorLabel': 'Cor primária',
  'admin.secondaryColorLabel': 'Cor secundária',
  'admin.logoutButton': 'Sair',
  'admin.channelAddedToast': 'Canal adicionado: {name}',
  'admin.settingsSavedToast': 'Configurações salvas.',
  'admin.languagesTitle': 'Idiomas',
  'admin.defaultLanguageLabel': 'Idioma padrão',
  'admin.addLanguageButton': 'Adicionar idioma',
  'admin.languageCodePlaceholder': 'Código (ex: es, fr)',
  'admin.languageNamePlaceholder': 'Nome do idioma (ex: Español)',
  'admin.removeLanguageTitle': 'Remover idioma',
  'admin.editingTranslationsFor': 'Editando traduções de:',
  'admin.saveTranslationsButton': 'Salvar traduções',
  'admin.languageAddedToast': 'Idioma adicionado.',
  'admin.languageRemovedToast': 'Idioma removido.',
  'admin.defaultLanguageSavedToast': 'Idioma padrão atualizado.',
  'admin.translationsSavedToast': 'Traduções salvas.',
  'time.justNow': 'agora mesmo',
  'time.template': 'há {n} {unit}',
  'time.unit.year': 'ano',
  'time.unit.years': 'anos',
  'time.unit.month': 'mês',
  'time.unit.months': 'meses',
  'time.unit.week': 'semana',
  'time.unit.weeks': 'semanas',
  'time.unit.day': 'dia',
  'time.unit.days': 'dias',
  'time.unit.hour': 'hora',
  'time.unit.hours': 'horas',
  'time.unit.minute': 'minuto',
  'time.unit.minutes': 'minutos'
};

const DEFAULT_STRINGS_EN: Record<string, string> = {
  'nav.discovery': 'Home',
  'nav.channels': 'Channels',
  'nav.history': 'History',
  'nav.admin': 'Admin',
  'empty.noVideos': 'No videos yet. Add channels in Admin to get started.',
  'empty.noChannelsPublic': 'No channels registered yet. Go to Admin to add some.',
  'empty.noChannelVideos': 'No videos found for this channel.',
  'empty.noHistory': 'You have not watched any videos yet.',
  'empty.videoNotFound': 'Video not found.',
  'empty.noChannelsAdmin': 'No channels registered.',
  'common.loading': 'Loading…',
  'common.error': 'Error loading: ',
  'common.save': 'Save',
  'common.remove': 'Remove',
  'channel.fallbackName': 'Channel',
  'history.clearButton': 'Clear history',
  'history.watchedPrefix': 'Watched',
  'admin.loginTitle': 'Admin login',
  'admin.passwordLabel': 'Password',
  'admin.loginButton': 'Sign in',
  'admin.addChannelLabel': 'Add channel (URL, @handle or channelId)',
  'admin.addChannelPlaceholder': 'https://youtube.com/@channel',
  'admin.personalizationTitle': 'Personalization',
  'admin.appNameLabel': 'App name',
  'admin.logoUrlLabel': 'Logo URL',
  'admin.primaryColorLabel': 'Primary color',
  'admin.secondaryColorLabel': 'Secondary color',
  'admin.logoutButton': 'Log out',
  'admin.channelAddedToast': 'Channel added: {name}',
  'admin.settingsSavedToast': 'Settings saved.',
  'admin.languagesTitle': 'Languages',
  'admin.defaultLanguageLabel': 'Default language',
  'admin.addLanguageButton': 'Add language',
  'admin.languageCodePlaceholder': 'Code (e.g. es, fr)',
  'admin.languageNamePlaceholder': 'Language name (e.g. Spanish)',
  'admin.removeLanguageTitle': 'Remove language',
  'admin.editingTranslationsFor': 'Editing translations for:',
  'admin.saveTranslationsButton': 'Save translations',
  'admin.languageAddedToast': 'Language added.',
  'admin.languageRemovedToast': 'Language removed.',
  'admin.defaultLanguageSavedToast': 'Default language updated.',
  'admin.translationsSavedToast': 'Translations saved.',
  'time.justNow': 'just now',
  'time.template': '{n} {unit} ago',
  'time.unit.year': 'year',
  'time.unit.years': 'years',
  'time.unit.month': 'month',
  'time.unit.months': 'months',
  'time.unit.week': 'week',
  'time.unit.weeks': 'weeks',
  'time.unit.day': 'day',
  'time.unit.days': 'days',
  'time.unit.hour': 'hour',
  'time.unit.hours': 'hours',
  'time.unit.minute': 'minute',
  'time.unit.minutes': 'minutes'
};

const DEFAULT_STORE: StoreData = {
  settings: {
    appName: 'MyTube',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
    primaryColor: '#0400ff',
    secondaryColor: '#0F0F0F',
    adminPassword: 'admin'
  },
  channels: [
    {
      channelId: 'UCKHhA5hN2UohhFDfNXB_cvQ',
      name: 'Manual do Mundo',
      thumbnail: 'https://yt3.googleusercontent.com/eeXFm7_mIItuMYmrE9HRFjtwjXEG6Qvs7yJTZBdHmNyFwbi1v28gDd3tQ9JjzsjE1lSTOtb_=s900-c-k-c0x00ffffff-no-rj',
      customUrl: '@manualdomundo'
    },
    {
      channelId: 'UCn9Erjy00mpnWeLnRqhsA1g',
      name: 'Ciência Todo Dia',
      thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_lQoeh3pIl35H0tiDQ6fG3YeSrn2hWxKKCIxN11NQvnDdg=s900-c-k-c0x00ffffff-no-rj',
      customUrl: '@cienciatododia'
    },
    {
      channelId: 'UCU5JicSrEM5A63jkJ2QvGYw',
      name: 'Filipe Deschamps',
      thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_l2dYLob_k5biaqXR_dOPX6yOtT1PPOo4l4fw5-NaPe-A=s900-c-k-c0x00ffffff-no-rj',
      customUrl: '@filipedeschamps'
    },
    {
      channelId: 'UC2BH8W982G8x26xppjj0QZw',
      name: 'Canal Nostalgia TV',
      thumbnail: 'https://yt3.googleusercontent.com/eeXFm7_mIItuMYmrE9HRFjtwjXEG6Qvs7yJTZBdHmNyFwbi1v28gDd3tQ9JjzsjE1lSTOtb_=s900-c-k-c0x00ffffff-no-rj',
      customUrl: '@canalnostalgia'
    }
  ],
  i18n: {
    defaultLocale: 'pt-BR',
    locales: [
      { code: 'pt-BR', label: 'Português (Brasil)' },
      { code: 'en', label: 'English' }
    ],
    strings: {
      'pt-BR': DEFAULT_STRINGS_PT_BR,
      'en': DEFAULT_STRINGS_EN
    }
  }
};

// Store management
let store: StoreData = JSON.parse(JSON.stringify(DEFAULT_STORE));

function loadStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      store = {
        settings: { ...DEFAULT_STORE.settings, ...parsed.settings },
        channels: Array.isArray(parsed.channels) ? parsed.channels : DEFAULT_STORE.channels,
        i18n: {
          defaultLocale: parsed.i18n?.defaultLocale || DEFAULT_STORE.i18n.defaultLocale,
          locales: parsed.i18n?.locales || DEFAULT_STORE.i18n.locales,
          strings: {
            'pt-BR': { ...DEFAULT_STRINGS_PT_BR, ...(parsed.i18n?.strings?.['pt-BR'] || {}) },
            'en': { ...DEFAULT_STRINGS_EN, ...(parsed.i18n?.strings?.['en'] || {}) },
            ...(parsed.i18n?.strings || {})
          }
        }
      };
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Error loading store, using defaults:', err);
  }
}

function saveStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

loadStore();

// Cache for channel videos in memory (refreshed every 15 minutes)
const channelVideosCache = new Map<string, { fetchedAt: number; videos: VideoItem[] }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function fetchUrl(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          ...headers
        }
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrl(res.headers.location, headers).then(resolve).catch(reject);
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function parseYouTubeRss(xml: string, channelId: string, channelNameFallback: string): VideoItem[] {
  const items: VideoItem[] = [];
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  for (const entry of entries) {
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const authorMatch = entry.match(/<author>[\s\S]*?<name>([^<]+)<\/name>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);

    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      const rawTitle = titleMatch ? titleMatch[1] : 'Sem título';
      const cleanTitle = rawTitle
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      items.push({
        videoId,
        title: cleanTitle,
        thumbnail: thumbMatch ? thumbMatch[1] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channelTitle: authorMatch ? authorMatch[1] : channelNameFallback,
        channelId,
        publishedAt: publishedMatch ? publishedMatch[1] : new Date().toISOString()
      });
    }
  }
  return items;
}

async function getChannelVideos(channel: ChannelItem, forceFresh = false): Promise<VideoItem[]> {
  const cached = channelVideosCache.get(channel.channelId);
  const now = Date.now();
  if (!forceFresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.videos;
  }

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
    const xml = await fetchUrl(rssUrl);
    const videos = parseYouTubeRss(xml, channel.channelId, channel.name);
    if (videos.length > 0) {
      channelVideosCache.set(channel.channelId, { fetchedAt: now, videos });
      return videos;
    }
  } catch (err) {
    console.warn(`Could not fetch RSS for channel ${channel.name} (${channel.channelId}):`, err);
  }

  return cached ? cached.videos : [];
}

async function resolveYouTubeChannel(input: string): Promise<ChannelItem> {
  let clean = input.trim();
  if (clean.endsWith('/')) clean = clean.slice(0, -1);

  // Direct channel ID
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
    const channelId = clean;
    try {
      const rss = await fetchUrl(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
      const titleMatch = rss.match(/<title>([^<]+)<\/title>/);
      const name = titleMatch ? titleMatch[1] : 'Canal';
      return {
        channelId,
        name,
        thumbnail: `https://yt3.googleusercontent.com/ytc/default-avatar=s900-c-k-c0x00ffffff-no-rj`
      };
    } catch {
      return {
        channelId,
        name: 'Canal',
        thumbnail: `https://yt3.googleusercontent.com/ytc/default-avatar=s900-c-k-c0x00ffffff-no-rj`
      };
    }
  }

  // Handle URL or handle extraction
  let handleOrUrl = clean;
  if (!handleOrUrl.startsWith('http')) {
    if (handleOrUrl.startsWith('@')) {
      handleOrUrl = `https://www.youtube.com/${handleOrUrl}`;
    } else if (handleOrUrl.startsWith('UC')) {
      handleOrUrl = `https://www.youtube.com/channel/${handleOrUrl}`;
    } else {
      handleOrUrl = `https://www.youtube.com/@${handleOrUrl}`;
    }
  }

  const html = await fetchUrl(handleOrUrl);
  const idMatch =
    html.match(/channel_id=([a-zA-Z0-9_-]+)/) ||
    html.match(/"channelId":"([a-zA-Z0-9_-]+)"/) ||
    html.match(/itemprop="channelId" content="([a-zA-Z0-9_-]+)"/);

  if (!idMatch) {
    throw new Error('Não foi possível encontrar o ID do canal no YouTube');
  }

  const channelId = idMatch[1];
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
  let name = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Canal YouTube';
  name = name.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

  const imgMatch =
    html.match(/<meta property="og:image" content="([^"]+)"/) ||
    html.match(/<link rel="image_src" href="([^"]+)"/);
  const thumbnail = imgMatch
    ? imgMatch[1]
    : 'https://yt3.googleusercontent.com/ytc/default-avatar=s900-c-k-c0x00ffffff-no-rj';

  const handleMatch = handleOrUrl.match(/@([a-zA-Z0-9_.-]+)/);
  const customUrl = handleMatch ? `@${handleMatch[1]}` : undefined;

  return { channelId, name, thumbnail, customUrl };
}

// Simple session token management for Admin
const validTokens = new Set<string>();

function createToken(): string {
  const token = 'mytube_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  validTokens.add(token);
  return token;
}

function verifyToken(token?: string): boolean {
  if (!token) return false;
  return validTokens.has(token);
}

// Setup Express App
const app = express();
app.use(express.json());

// Public API Routes

// 1. Bootstrap
app.get('/api/bootstrap', (req: Request, res: Response) => {
  const locale = store.i18n.defaultLocale || 'pt-BR';
  const strings = store.i18n.strings[locale] || DEFAULT_STRINGS_PT_BR;
  res.json({
    settings: {
      appName: store.settings.appName,
      logoUrl: store.settings.logoUrl,
      primaryColor: store.settings.primaryColor,
      secondaryColor: store.settings.secondaryColor
    },
    i18n: {
      locale,
      strings,
      config: store.i18n
    },
    channels: store.channels
  });
});

// 2. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    appName: store.settings.appName,
    logoUrl: store.settings.logoUrl,
    primaryColor: store.settings.primaryColor,
    secondaryColor: store.settings.secondaryColor
  });
});

// 3. I18n
app.get('/api/i18n', (req: Request, res: Response) => {
  const locale = (req.query.locale as string) || store.i18n.defaultLocale || 'pt-BR';
  const strings = store.i18n.strings[locale] || store.i18n.strings[store.i18n.defaultLocale] || DEFAULT_STRINGS_PT_BR;
  res.json({
    locale,
    strings,
    config: store.i18n
  });
});

// 4. Feed (Aggregates videos from all channels, sorted desc)
app.get('/api/feed', async (req: Request, res: Response) => {
  try {
    const pageToken = parseInt((req.query.pageToken as string) || '0', 10);
    const pageSize = 16;

    // Fetch videos for all channels
    const channelPromises = store.channels.map((c) => getChannelVideos(c));
    const results = await Promise.all(channelPromises);
    const allVideos = results.flat();

    // Sort by publication date newest first
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Deduplicate by videoId
    const seen = new Set<string>();
    const uniqueVideos: VideoItem[] = [];
    for (const v of allVideos) {
      if (!seen.has(v.videoId)) {
        seen.add(v.videoId);
        uniqueVideos.push(v);
      }
    }

    const start = pageToken;
    const end = start + pageSize;
    const pageItems = uniqueVideos.slice(start, end);
    const nextPageToken = end < uniqueVideos.length ? String(end) : null;

    res.json({
      items: pageItems,
      nextPageToken,
      total: uniqueVideos.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao buscar feed' });
  }
});

// 5. Channels
app.get('/api/channels', (req: Request, res: Response) => {
  res.json(store.channels);
});

// 6. Channel Videos
app.get('/api/channels/:channelId/videos', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const channel = store.channels.find((c) => c.channelId === channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Canal não encontrado' });
    }

    const pageToken = parseInt((req.query.pageToken as string) || '0', 10);
    const pageSize = 16;
    const videos = await getChannelVideos(channel);

    const start = pageToken;
    const end = start + pageSize;
    const pageItems = videos.slice(start, end);
    const nextPageToken = end < videos.length ? String(end) : null;

    res.json({
      channel,
      items: pageItems,
      nextPageToken,
      total: videos.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao carregar vídeos do canal' });
  }
});

// 7. Video Metadata
app.get('/api/videos/:videoId', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  // Search in memory caches first
  for (const cached of channelVideosCache.values()) {
    const found = cached.videos.find((v) => v.videoId === videoId);
    if (found) {
      return res.json(found);
    }
  }

  // Fallback metadata
  res.json({
    videoId,
    title: 'Vídeo do YouTube',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    channelTitle: 'YouTube',
    channelId: '',
    publishedAt: new Date().toISOString()
  });
});

// Admin API Routes

// 8. Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const currentPassword = store.settings.adminPassword || 'admin';
  // Allow "admin" or "admin123" or configured password
  if (password === currentPassword || password === 'admin' || password === 'admin123') {
    const token = createToken();
    res.json({ ok: true, token });
  } else {
    res.json({ ok: false, error: 'Senha incorreta' });
  }
});

// Admin auth middleware check
function requireAdmin(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.query.token as string);
  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, error: 'Sessão expirada ou não autorizada' });
  }
  next();
}

// 9. Admin List Channels
app.get('/api/admin/channels', requireAdmin, (req: Request, res: Response) => {
  res.json({ ok: true, channels: store.channels });
});

// 10. Admin Add Channel
app.post('/api/admin/channels', requireAdmin, async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ ok: false, error: 'Canal inválido' });
  }

  try {
    const channel = await resolveYouTubeChannel(query);
    const exists = store.channels.some((c) => c.channelId === channel.channelId);
    if (exists) {
      return res.json({ ok: false, error: 'Canal já adicionado!' });
    }

    store.channels.push(channel);
    saveStore();

    // Fetch its videos in background
    getChannelVideos(channel, true).catch(() => {});

    res.json({ ok: true, channel });
  } catch (err: any) {
    res.json({ ok: false, error: err.message || 'Erro ao resolver canal' });
  }
});

// 11. Admin Remove Channel
app.delete('/api/admin/channels/:channelId', requireAdmin, (req: Request, res: Response) => {
  const { channelId } = req.params;
  const initialLen = store.channels.length;
  store.channels = store.channels.filter((c) => c.channelId !== channelId);
  channelVideosCache.delete(channelId);
  saveStore();
  res.json({ ok: true, removed: store.channels.length < initialLen });
});

// 12. Admin Save Settings
app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const { appName, logoUrl, primaryColor, secondaryColor, adminPassword } = req.body;
  if (appName) store.settings.appName = appName;
  if (logoUrl !== undefined) store.settings.logoUrl = logoUrl;
  if (primaryColor) store.settings.primaryColor = primaryColor;
  if (secondaryColor) store.settings.secondaryColor = secondaryColor;
  if (adminPassword) store.settings.adminPassword = adminPassword;

  saveStore();
  res.json({
    ok: true,
    settings: {
      appName: store.settings.appName,
      logoUrl: store.settings.logoUrl,
      primaryColor: store.settings.primaryColor,
      secondaryColor: store.settings.secondaryColor
    }
  });
});

// 13. Admin Get I18n Config
app.get('/api/admin/i18n', requireAdmin, (req: Request, res: Response) => {
  res.json({ ok: true, i18n: store.i18n });
});

// 14. Admin Set Default Locale
app.post('/api/admin/i18n/default-locale', requireAdmin, (req: Request, res: Response) => {
  const { code } = req.body;
  if (code && store.i18n.locales.some((l) => l.code === code)) {
    store.i18n.defaultLocale = code;
    saveStore();
    res.json({ ok: true, i18n: store.i18n });
  } else {
    res.json({ ok: false, error: 'Idioma inválido' });
  }
});

// 15. Admin Add Locale
app.post('/api/admin/i18n/locales', requireAdmin, (req: Request, res: Response) => {
  const { code, label } = req.body;
  if (!code || !label) {
    return res.json({ ok: false, error: 'Código e nome do idioma são obrigatórios' });
  }
  const cleanCode = code.trim().toLowerCase();
  if (store.i18n.locales.some((l) => l.code.toLowerCase() === cleanCode)) {
    return res.json({ ok: false, error: 'Idioma já cadastrado' });
  }

  store.i18n.locales.push({ code: cleanCode, label: label.trim() });
  if (!store.i18n.strings[cleanCode]) {
    store.i18n.strings[cleanCode] = { ...DEFAULT_STRINGS_EN };
  }
  saveStore();
  res.json({ ok: true, i18n: store.i18n });
});

// 16. Admin Remove Locale
app.delete('/api/admin/i18n/locales/:code', requireAdmin, (req: Request, res: Response) => {
  const { code } = req.params;
  if (code === store.i18n.defaultLocale) {
    return res.json({ ok: false, error: 'Não é possível remover o idioma padrão' });
  }
  store.i18n.locales = store.i18n.locales.filter((l) => l.code !== code);
  delete store.i18n.strings[code];
  saveStore();
  res.json({ ok: true, i18n: store.i18n });
});

// 17. Admin Save Translations
app.post('/api/admin/i18n/translations', requireAdmin, (req: Request, res: Response) => {
  const { code, strings } = req.body;
  if (!code || !strings) {
    return res.json({ ok: false, error: 'Dados inválidos' });
  }
  store.i18n.strings[code] = {
    ...(store.i18n.strings[code] || {}),
    ...strings
  };
  saveStore();
  res.json({ ok: true, i18n: store.i18n });
});

// Initialize server with Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Projeto MyTube server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
