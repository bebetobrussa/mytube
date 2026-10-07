import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { VideoItem, ChannelItem, AppSettings, I18nConfig } from './types';

// Translation groups matching Projeto MyTube
const TRANSLATION_FIELD_GROUPS = [
  {
    title: 'Navigation',
    keys: ['nav.discovery', 'nav.channels', 'nav.history', 'nav.admin']
  },
  {
    title: 'Empty states',
    keys: [
      'empty.noVideos',
      'empty.noChannelsPublic',
      'empty.noChannelVideos',
      'empty.noHistory',
      'empty.videoNotFound',
      'empty.noChannelsAdmin'
    ]
  },
  {
    title: 'Common',
    keys: ['common.loading', 'common.error', 'common.save', 'common.remove']
  },
  {
    title: 'Channel',
    keys: ['channel.fallbackName']
  },
  {
    title: 'History',
    keys: ['history.clearButton', 'history.watchedPrefix']
  },
  {
    title: 'Admin',
    keys: [
      'admin.loginTitle',
      'admin.passwordLabel',
      'admin.loginButton',
      'admin.addChannelLabel',
      'admin.addChannelPlaceholder',
      'admin.personalizationTitle',
      'admin.appNameLabel',
      'admin.logoUrlLabel',
      'admin.primaryColorLabel',
      'admin.secondaryColorLabel',
      'admin.logoutButton',
      'admin.channelAddedToast',
      'admin.settingsSavedToast',
      'admin.languagesTitle',
      'admin.defaultLanguageLabel',
      'admin.addLanguageButton',
      'admin.languageCodePlaceholder',
      'admin.languageNamePlaceholder',
      'admin.removeLanguageTitle',
      'admin.editingTranslationsFor',
      'admin.saveTranslationsButton',
      'admin.languageAddedToast',
      'admin.languageRemovedToast',
      'admin.defaultLanguageSavedToast',
      'admin.translationsSavedToast'
    ]
  },
  {
    title: 'Relative time',
    keys: [
      'time.justNow',
      'time.template',
      'time.unit.year',
      'time.unit.years',
      'time.unit.month',
      'time.unit.months',
      'time.unit.week',
      'time.unit.weeks',
      'time.unit.day',
      'time.unit.days',
      'time.unit.hour',
      'time.unit.hours',
      'time.unit.minute',
      'time.unit.minutes'
    ]
  }
];

// SVG Symbols from the original MyTube application
function SvgSymbols() {
  return (
    <svg style={{ display: 'none' }} aria-hidden="true">
      <symbol id="icon-discovery" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2 2 7l10 5 10-5-10-5Zm0 7L4.4 5.5 12 2l7.6 3.5L12 9Zm-8 3v6c0 1.1 3.6 3 8 3s8-1.9 8-3v-6l-8 4-8-4Z" />
      </symbol>
      <symbol id="icon-channels" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17 11c1.66 0 2.99-1.34 2.99-3S18.66 5 17 5c-1.66 0-3 1.34-3 3s1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm9 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
      </symbol>
      <symbol id="icon-history" viewBox="0 0 24 24">
        <path fill="currentColor" d="M13 3a9 9 0 1 0 8.94 10H19.9A7 7 0 1 1 13 5c1.66 0 3.18.57 4.39 1.53L14 10h7V3l-2.35 2.35A8.96 8.96 0 0 0 13 3Zm-1 5v5l4.24 2.52.76-1.28-3.5-2.08V8H12Z" />
      </symbol>
      <symbol id="icon-admin" viewBox="0 0 24 24">
        <path fill="currentColor" d="m19.43 12.98.04-.98-.04-.98 2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.3 7.3 0 0 0-1.7-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65c-.61.25-1.18.58-1.7.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L4.57 11l-.04.98.04.98-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.14.24.42.32.6.22l2.49-1c.52.4 1.09.73 1.7.98l.38 2.65c.05.24.25.42.49.42h4c.24 0 .44-.18.49-.42l.38-2.65c.61-.25 1.18-.58 1.7-.98l2.49 1c.24.1.5 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
      </symbol>
      <symbol id="icon-play" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
      </symbol>
      <symbol id="icon-trash" viewBox="0 0 24 24">
        <path fill="currentColor" d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9Zm2 5h2v9h-2V8ZM7 8h2v9H7V8Zm8 0h2v9h-2V8Z" />
      </symbol>
      <symbol id="icon-plus" viewBox="0 0 24 24">
        <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />
      </symbol>
      <symbol id="icon-close" viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.3 6.3-1.42-1.41L9.17 12 2.87 5.71 4.3 4.29l6.29 6.3 6.29-6.3 1.42 1.42Z" />
      </symbol>
      <symbol id="icon-logout" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10 17v-2H3V9h7V7l5 5-5 5Zm9-14H12v2h7v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Z" />
      </symbol>
      <symbol id="icon-back" viewBox="0 0 24 24">
        <path fill="currentColor" d="M20 11H7.83l4.88-4.88L11.29 4.7l-7.3 7.3 7.3 7.3 1.42-1.42L7.83 13H20v-2Z" />
      </symbol>
    </svg>
  );
}

// Local Storage Watch History helper
const HistoryStorage = {
  KEY: 'watch_history',
  MAX_ITEMS: 200,
  getAll: (): VideoItem[] => {
    try {
      const raw = localStorage.getItem(HistoryStorage.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  add: (video: VideoItem) => {
    const items = HistoryStorage.getAll().filter((v) => v.videoId !== video.videoId);
    items.unshift({
      ...video,
      watchedAt: Date.now()
    });
    if (items.length > HistoryStorage.MAX_ITEMS) {
      items.splice(HistoryStorage.MAX_ITEMS);
    }
    try {
      localStorage.setItem(HistoryStorage.KEY, JSON.stringify(items));
    } catch {
      // storage quota or disabled
    }
  },
  clear: () => {
    localStorage.removeItem(HistoryStorage.KEY);
  }
};

export default function App() {
  // Settings & App state
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'MyTube',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
    primaryColor: '#0400ff',
    secondaryColor: '#0F0F0F'
  });

  const [i18nConfig, setI18nConfig] = useState<I18nConfig>({
    defaultLocale: 'pt-BR',
    locales: [
      { code: 'pt-BR', label: 'Português (Brasil)' },
      { code: 'en', label: 'English' }
    ],
    strings: {
      'pt-BR': {},
      en: {}
    }
  });

  const [currentLocale, setCurrentLocale] = useState<string>('pt-BR');
  const [strings, setStrings] = useState<Record<string, string>>({});
  const [channels, setChannels] = useState<ChannelItem[]>([]);

  // Navigation State
  const [route, setRoute] = useState<{ page: string; param?: string }>({ page: 'discovery' });

  // Admin Auth state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('mytube_admin_token');
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (!msg) return;
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  }, []);

  // Translation helper function
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let str = strings[key] || i18nConfig.strings?.[currentLocale]?.[key] || i18nConfig.strings?.en?.[key] || key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.split(`{${k}}`).join(String(vars[k]));
        });
      }
      return str;
    },
    [strings, i18nConfig, currentLocale]
  );

  // Relative Date Formatter
  const formatRelativeDate = useCallback(
    (dateLike?: string | number): string => {
      if (!dateLike) return '';
      const diffSec = Math.floor((Date.now() - new Date(dateLike).getTime()) / 1000);
      if (diffSec < 60) return t('time.justNow');
      const units: [string, string, number][] = [
        ['year', 'years', 31536000],
        ['month', 'months', 2592000],
        ['week', 'weeks', 604800],
        ['day', 'days', 86400],
        ['hour', 'hours', 3600],
        ['minute', 'minutes', 60]
      ];
      for (const [unitSingle, unitPlural, secondsInUnit] of units) {
        const count = Math.floor(diffSec / secondsInUnit);
        if (count >= 1) {
          const unitKey = `time.unit.${count === 1 ? unitSingle : unitPlural}`;
          return t('time.template', { n: count, unit: t(unitKey) });
        }
      }
      return t('time.justNow');
    },
    [t]
  );

  // Apply colors to root CSS variables & document title
  const applySettingsToTheme = useCallback((s: AppSettings) => {
    document.documentElement.style.setProperty('--color-primary', s.primaryColor || '#0400ff');
    document.documentElement.style.setProperty('--color-bg', s.secondaryColor || '#0F0F0F');
    if (s.appName) {
      document.title = s.appName;
    }
  }, []);

  // Fetch initial bootstrap
  useEffect(() => {
    async function loadBootstrap() {
      try {
        const res = await fetch('/api/bootstrap');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
            applySettingsToTheme(data.settings);
          }
          if (data.i18n) {
            setCurrentLocale(data.i18n.locale);
            setStrings(data.i18n.strings);
            if (data.i18n.config) {
              setI18nConfig(data.i18n.config);
            }
          }
          if (data.channels) {
            setChannels(data.channels);
          }
        }
      } catch (err) {
        console.error('Failed to load bootstrap data:', err);
      }
    }
    loadBootstrap();
  }, [applySettingsToTheme]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const parts = hash.split('/').filter(Boolean);
      const page = parts[0] || 'discovery';
      const param = parts[1];
      setRoute({ page, param });
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Active navigation top bar mapping
  const routeTopMap: Record<string, string> = {
    discovery: 'discovery',
    channels: 'channels',
    channel: 'channels',
    history: 'history',
    admin: 'admin'
  };
  const activeNav = routeTopMap[route.page] || 'discovery';

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  // -------------------------
  // Page Components
  // -------------------------

  // 1. Discovery View
  function DiscoveryView() {
    const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadFeed = async (token: string | null = null) => {
      try {
        const url = token ? `/api/feed?pageToken=${token}` : '/api/feed';
        const res = await fetch(url);
        const data = await res.json();
        if (token) {
          setFeedVideos((prev) => [...prev, ...(data.items || [])]);
        } else {
          setFeedVideos(data.items || []);
        }
        setNextPageToken(data.nextPageToken || null);
      } catch (err) {
        console.error('Error loading feed:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    useEffect(() => {
      loadFeed();
    }, []);

    // Infinite scroll observer
    useEffect(() => {
      if (!sentinelRef.current || !nextPageToken || loadingMore) return;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loadingMore) {
          setLoadingMore(true);
          loadFeed(nextPageToken);
        }
      });
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }, [nextPageToken, loadingMore]);

    return (
      <div>
        <div className="page-title">{t('nav.discovery')}</div>

        {loading ? (
          <div className="video-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="video-card skeleton-card">
                <div className="thumb-wrap skeleton" />
                <div className="skeleton skeleton-line" style={{ width: '90%' }} />
                <div className="skeleton skeleton-line" style={{ width: '50%' }} />
              </div>
            ))}
          </div>
        ) : feedVideos.length === 0 ? (
          <div className="empty-state">{t('empty.noVideos')}</div>
        ) : (
          <div className="video-grid" id="feed-grid">
            {feedVideos.map((video) => (
              <a
                key={video.videoId}
                className="video-card"
                href={`#/video/${encodeURIComponent(video.videoId)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(`#/video/${encodeURIComponent(video.videoId)}`);
                }}
              >
                <div className="thumb-wrap">
                  <img loading="lazy" src={video.thumbnail} alt={video.title} />
                </div>
                <div className="meta">
                  <div className="title">{video.title}</div>
                  <div className="channel-name">{video.channelTitle}</div>
                  <div className="publish-date">{formatRelativeDate(video.publishedAt)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {nextPageToken && <div ref={sentinelRef} id="infinite-scroll-sentinel" />}
        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
            {t('common.loading')}
          </div>
        )}
      </div>
    );
  }

  // 2. Channels List View
  function ChannelsView() {
    const [channelList, setChannelList] = useState<ChannelItem[]>(channels);
    const [loading, setLoading] = useState(channelList.length === 0);

    useEffect(() => {
      async function fetchChannels() {
        try {
          const res = await fetch('/api/channels');
          if (res.ok) {
            const data = await res.json();
            setChannelList(data);
            setChannels(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      fetchChannels();
    }, []);

    return (
      <div>
        <div className="page-title">{t('nav.channels')}</div>
        {loading ? (
          <div className="channel-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="channel-card">
                <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '50%' }} />
                <div className="skeleton skeleton-line" style={{ width: '80%' }} />
              </div>
            ))}
          </div>
        ) : channelList.length === 0 ? (
          <div className="empty-state">{t('empty.noChannelsPublic')}</div>
        ) : (
          <div className="channel-grid">
            {channelList.map((c) => (
              <a
                key={c.channelId}
                className="channel-card"
                href={`#/channel/${encodeURIComponent(c.channelId)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(`#/channel/${encodeURIComponent(c.channelId)}`);
                }}
              >
                <img src={c.thumbnail} alt={c.name} />
                <div className="name">{c.name}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Channel Detail View
  function ChannelDetailView({ channelId }: { channelId: string }) {
    const [channel, setChannel] = useState<ChannelItem | null>(() => {
      return channels.find((c) => c.channelId === channelId) || null;
    });
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const fetchVideos = async (token: string | null = null) => {
      try {
        const url = token
          ? `/api/channels/${encodeURIComponent(channelId)}/videos?pageToken=${token}`
          : `/api/channels/${encodeURIComponent(channelId)}/videos`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.channel) setChannel(data.channel);
          if (token) {
            setVideos((prev) => [...prev, ...(data.items || [])]);
          } else {
            setVideos(data.items || []);
          }
          setNextPageToken(data.nextPageToken || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    useEffect(() => {
      fetchVideos();
    }, [channelId]);

    useEffect(() => {
      if (!sentinelRef.current || !nextPageToken || loadingMore) return;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loadingMore) {
          setLoadingMore(true);
          fetchVideos(nextPageToken);
        }
      });
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }, [nextPageToken, loadingMore]);

    return (
      <div>
        <a
          className="back-btn"
          href="#/channels"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('#/channels');
          }}
        >
          <svg>
            <use href="#icon-back" />
          </svg>
          {t('nav.channels')}
        </a>

        {channel && (
          <div className="channel-header">
            <img src={channel.thumbnail} alt={channel.name} />
            <h1>{channel.name}</h1>
          </div>
        )}

        {loading ? (
          <div className="video-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="video-card skeleton-card">
                <div className="thumb-wrap skeleton" />
                <div className="skeleton skeleton-line" style={{ width: '90%' }} />
                <div className="skeleton skeleton-line" style={{ width: '50%' }} />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">{t('empty.noChannelVideos')}</div>
        ) : (
          <div className="video-grid" id="channel-grid">
            {videos.map((video) => (
              <a
                key={video.videoId}
                className="video-card"
                href={`#/video/${encodeURIComponent(video.videoId)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(`#/video/${encodeURIComponent(video.videoId)}`);
                }}
              >
                <div className="thumb-wrap">
                  <img loading="lazy" src={video.thumbnail} alt={video.title} />
                </div>
                <div className="meta">
                  <div className="title">{video.title}</div>
                  <div className="channel-name">{video.channelTitle}</div>
                  <div className="publish-date">{formatRelativeDate(video.publishedAt)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {nextPageToken && <div ref={sentinelRef} id="infinite-scroll-sentinel" />}
        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
            {t('common.loading')}
          </div>
        )}
      </div>
    );
  }

  // 4. Video Watch View
  function VideoWatchView({ videoId }: { videoId: string }) {
    const [video, setVideo] = useState<VideoItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function loadMeta() {
        try {
          const res = await fetch(`/api/videos/${encodeURIComponent(videoId)}`);
          if (res.ok) {
            const data: VideoItem = await res.json();
            setVideo(data);
            HistoryStorage.add(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadMeta();
    }, [videoId]);

    return (
      <div className="video-page">
        <a
          className="back-btn"
          href="#/discovery"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('#/discovery');
          }}
        >
          <svg>
            <use href="#icon-back" />
          </svg>
          {t('nav.discovery')}
        </a>

        <div className="player-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
            title={video?.title || 'YouTube video player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {loading ? (
          <div>
            <div className="skeleton skeleton-line" style={{ width: '70%', height: '22px' }} />
            <div className="skeleton skeleton-line" style={{ width: '40%', height: '14px', marginTop: '10px' }} />
          </div>
        ) : (
          <div>
            <h1>{video?.title || 'Vídeo'}</h1>
            <div className="video-meta-row">
              <span>{video?.channelTitle || ''}</span>
              <span>{formatRelativeDate(video?.publishedAt)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. Watch History View
  function HistoryView() {
    const [historyItems, setHistoryItems] = useState<VideoItem[]>(() => HistoryStorage.getAll());

    const handleClear = () => {
      HistoryStorage.clear();
      setHistoryItems([]);
      showToast(t('history.clearButton'));
    };

    return (
      <div>
        <div className="page-title">{t('nav.history')}</div>

        {historyItems.length === 0 ? (
          <div className="empty-state">{t('empty.noHistory')}</div>
        ) : (
          <>
            <div className="form-actions" style={{ marginBottom: '16px' }}>
              <button className="btn btn-danger" onClick={handleClear}>
                {t('history.clearButton')}
              </button>
            </div>
            <div className="video-grid">
              {historyItems.map((item) => (
                <a
                  key={item.videoId}
                  className="video-card"
                  href={`#/video/${encodeURIComponent(item.videoId)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(`#/video/${encodeURIComponent(item.videoId)}`);
                  }}
                >
                  <div className="thumb-wrap">
                    <img loading="lazy" src={item.thumbnail} alt={item.title} />
                  </div>
                  <div className="meta">
                    <div className="title">{item.title}</div>
                    <div className="channel-name">{item.channelTitle}</div>
                    <div className="publish-date">
                      {t('history.watchedPrefix')} {formatRelativeDate(item.watchedAt)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // 6. Admin View
  function AdminView() {
    const [passwordInput, setPasswordInput] = useState('');
    const [submittingLogin, setSubmittingLogin] = useState(false);

    // Dashboard State
    const [adminChannels, setAdminChannels] = useState<ChannelItem[]>(channels);
    const [newChannelInput, setNewChannelInput] = useState('');
    const [addingChannel, setAddingChannel] = useState(false);

    // Personalization State
    const [appName, setAppName] = useState(settings.appName);
    const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
    const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
    const [savingSettings, setSavingSettings] = useState(false);

    // Languages & Translations State
    const [editingLocale, setEditingLocale] = useState<string>(i18nConfig.defaultLocale || 'pt-BR');
    const [newLocaleCode, setNewLocaleCode] = useState('');
    const [newLocaleLabel, setNewLocaleLabel] = useState('');
    const [localStringsMap, setLocalStringsMap] = useState<Record<string, string>>({});
    const [savingTranslations, setSavingTranslations] = useState(false);

    // Sync editing locale translations
    useEffect(() => {
      const en = i18nConfig.strings?.en || {};
      const current = i18nConfig.strings?.[editingLocale] || {};
      setLocalStringsMap({ ...en, ...current });
    }, [editingLocale, i18nConfig]);

    // Fetch fresh admin data if authenticated
    useEffect(() => {
      if (!adminToken) return;
      async function loadAdminData() {
        try {
          const res = await fetch('/api/admin/channels', {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          const data = await res.json();
          if (data.ok) {
            setAdminChannels(data.channels);
          } else {
            sessionStorage.removeItem('mytube_admin_token');
            setAdminToken(null);
          }
        } catch {
          // ignore
        }
      }
      loadAdminData();
    }, [adminToken]);

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!passwordInput.trim()) return;
      setSubmittingLogin(true);
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput })
        });
        const data = await res.json();
        if (data.ok && data.token) {
          sessionStorage.setItem('mytube_admin_token', data.token);
          setAdminToken(data.token);
        } else {
          showToast(data.error || 'Senha incorreta');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao conectar');
      } finally {
        setSubmittingLogin(false);
      }
    };

    const handleLogout = () => {
      sessionStorage.removeItem('mytube_admin_token');
      setAdminToken(null);
      setPasswordInput('');
    };

    const handleAddChannel = async (e: React.FormEvent) => {
      e.preventDefault();
      const val = newChannelInput.trim();
      if (!val) return;
      setAddingChannel(true);
      try {
        const res = await fetch('/api/admin/channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ query: val })
        });
        const data = await res.json();
        if (data.ok && data.channel) {
          setAdminChannels((prev) => [...prev, data.channel]);
          setChannels((prev) => [...prev, data.channel]);
          setNewChannelInput('');
          showToast(t('admin.channelAddedToast', { name: data.channel.name }));
        } else {
          showToast(data.error || 'Erro ao adicionar canal');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao adicionar canal');
      } finally {
        setAddingChannel(false);
      }
    };

    const handleRemoveChannel = async (channelId: string) => {
      try {
        const res = await fetch(`/api/admin/channels/${encodeURIComponent(channelId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (data.ok) {
          setAdminChannels((prev) => prev.filter((c) => c.channelId !== channelId));
          setChannels((prev) => prev.filter((c) => c.channelId !== channelId));
        } else {
          showToast(data.error || 'Erro ao remover');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao remover');
      }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingSettings(true);
      try {
        const newSettings = {
          appName: appName.trim() || 'MyTube',
          logoUrl: logoUrl.trim(),
          primaryColor,
          secondaryColor
        };
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify(newSettings)
        });
        const data = await res.json();
        if (data.ok && data.settings) {
          setSettings(data.settings);
          applySettingsToTheme(data.settings);
          showToast(t('admin.settingsSavedToast'));
        } else {
          showToast(data.error || 'Erro ao salvar');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao salvar');
      } finally {
        setSavingSettings(false);
      }
    };

    const handleSetDefaultLocale = async (code: string) => {
      try {
        const res = await fetch('/api/admin/i18n/default-locale', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (data.ok && data.i18n) {
          setI18nConfig(data.i18n);
          setCurrentLocale(code);
          setStrings(data.i18n.strings[code] || {});
          showToast(t('admin.defaultLanguageSavedToast'));
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao atualizar idioma padrão');
      }
    };

    const handleAddLocale = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLocaleCode.trim() || !newLocaleLabel.trim()) return;
      try {
        const res = await fetch('/api/admin/i18n/locales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ code: newLocaleCode, label: newLocaleLabel })
        });
        const data = await res.json();
        if (data.ok && data.i18n) {
          setI18nConfig(data.i18n);
          setEditingLocale(newLocaleCode.trim().toLowerCase());
          setNewLocaleCode('');
          setNewLocaleLabel('');
          showToast(t('admin.languageAddedToast'));
        } else {
          showToast(data.error || 'Erro ao adicionar idioma');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao adicionar idioma');
      }
    };

    const handleRemoveLocale = async (code: string) => {
      try {
        const res = await fetch(`/api/admin/i18n/locales/${encodeURIComponent(code)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (data.ok && data.i18n) {
          setI18nConfig(data.i18n);
          if (editingLocale === code) {
            setEditingLocale(data.i18n.defaultLocale);
          }
          showToast(t('admin.languageRemovedToast'));
        } else {
          showToast(data.error || 'Erro ao remover idioma');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao remover idioma');
      }
    };

    const handleSaveTranslations = async () => {
      setSavingTranslations(true);
      try {
        const res = await fetch('/api/admin/i18n/translations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ code: editingLocale, strings: localStringsMap })
        });
        const data = await res.json();
        if (data.ok && data.i18n) {
          setI18nConfig(data.i18n);
          if (editingLocale === currentLocale) {
            setStrings(data.i18n.strings[editingLocale] || {});
          }
          showToast(t('admin.translationsSavedToast'));
        } else {
          showToast(data.error || 'Erro ao salvar traduções');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao salvar traduções');
      } finally {
        setSavingTranslations(false);
      }
    };

    // Render Login screen if not authenticated
    if (!adminToken) {
      return (
        <div className="login-screen">
          <div className="page-title">{t('admin.loginTitle')}</div>
          <div className="card-panel">
            <form onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="admin-password">{t('admin.passwordLabel')}</label>
                <input
                  type="password"
                  id="admin-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="admin"
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={submittingLogin}
                >
                  {submittingLogin ? t('common.loading') : t('admin.loginButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Render Admin Dashboard
    return (
      <div>
        <div className="page-title">{t('nav.admin')}</div>

        {/* Panel 1: Channels Management */}
        <div className="card-panel">
          <div className="field">
            <label>{t('admin.addChannelLabel')}</label>
            <form onSubmit={handleAddChannel} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={t('admin.addChannelPlaceholder')}
                value={newChannelInput}
                onChange={(e) => setNewChannelInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingChannel || !newChannelInput.trim()}
              >
                <svg>
                  <use href="#icon-plus" />
                </svg>
              </button>
            </form>
          </div>

          <div id="admin-channel-list">
            {adminChannels.length === 0 ? (
              <div className="empty-state">{t('empty.noChannelsAdmin')}</div>
            ) : (
              adminChannels.map((c) => (
                <div key={c.channelId} className="admin-channel-row">
                  <img src={c.thumbnail} alt={c.name} />
                  <div className="name">{c.name}</div>
                  <button
                    className="icon-btn"
                    title={t('common.remove')}
                    onClick={() => handleRemoveChannel(c.channelId)}
                  >
                    <svg>
                      <use href="#icon-trash" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Personalization */}
        <div className="card-panel">
          <div className="page-title" style={{ fontSize: '16px' }}>
            {t('admin.personalizationTitle')}
          </div>
          <form onSubmit={handleSaveSettings}>
            <div className="field">
              <label>{t('admin.appNameLabel')}</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t('admin.logoUrlLabel')}</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t('admin.primaryColorLabel')}</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t('admin.secondaryColorLabel')}</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>

        {/* Panel 3: Languages & Translations */}
        <div className="card-panel">
          <div className="page-title" style={{ fontSize: '16px' }}>
            {t('admin.languagesTitle')}
          </div>
          <div className="field">
            <label>{t('admin.defaultLanguageLabel')}</label>
          </div>

          <div>
            {i18nConfig.locales.map((loc) => {
              const isDefault = loc.code === i18nConfig.defaultLocale;
              return (
                <label key={loc.code} className="locale-row">
                  <input
                    type="radio"
                    name="default-locale"
                    value={loc.code}
                    checked={isDefault}
                    onChange={() => handleSetDefaultLocale(loc.code)}
                  />
                  <span className="locale-label">{loc.label}</span>
                  <span className="locale-code">{loc.code}</span>
                  {!isDefault && (
                    <button
                      type="button"
                      className="icon-btn"
                      title={t('admin.removeLanguageTitle')}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveLocale(loc.code);
                      }}
                    >
                      <svg>
                        <use href="#icon-trash" />
                      </svg>
                    </button>
                  )}
                </label>
              );
            })}
          </div>

          <form className="add-locale-form" onSubmit={handleAddLocale}>
            <input
              type="text"
              name="locale-code"
              placeholder={t('admin.languageCodePlaceholder')}
              value={newLocaleCode}
              onChange={(e) => setNewLocaleCode(e.target.value)}
            />
            <input
              type="text"
              name="locale-label"
              placeholder={t('admin.languageNamePlaceholder')}
              value={newLocaleLabel}
              onChange={(e) => setNewLocaleLabel(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              {t('admin.addLanguageButton')}
            </button>
          </form>

          {/* Translations Editor */}
          <div className="translations-editor">
            <div className="field">
              <label>{t('admin.editingTranslationsFor')}</label>
              <select
                value={editingLocale}
                onChange={(e) => setEditingLocale(e.target.value)}
              >
                {i18nConfig.locales.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="translations-list">
              {TRANSLATION_FIELD_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="translations-group-title">{group.title}</div>
                  {group.keys.map((key) => {
                    const enHint = i18nConfig.strings?.en?.[key] || '';
                    return (
                      <div key={key} className="translation-field">
                        <label>
                          {key} <span className="i18n-hint">— EN: {enHint}</span>
                        </label>
                        <input
                          type="text"
                          value={localStringsMap[key] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalStringsMap((prev) => ({ ...prev, [key]: val }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveTranslations}
                disabled={savingTranslations}
              >
                {savingTranslations ? t('common.loading') : t('admin.saveTranslationsButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn btn-secondary"
          onClick={handleLogout}
          style={{ marginTop: '10px' }}
        >
          <svg>
            <use href="#icon-logout" />
          </svg>
          {t('admin.logoutButton')}
        </button>
      </div>
    );
  }

  return (
    <>
      <SvgSymbols />

      <div className="app-root">
        {/* Topbar */}
        <header className="topbar">
          <a
            className="topbar-brand"
            href="#/discovery"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/discovery');
            }}
          >
            {settings.logoUrl && (
              <img id="brand-logo" src={settings.logoUrl} alt={settings.appName} />
            )}
            <span id="brand-name">{settings.appName}</span>
          </a>
        </header>

        {/* Desktop Sidebar (>=900px) */}
        <nav className="sidebar" id="sidebar-nav">
          <a
            className={`nav-item ${activeNav === 'discovery' ? 'active' : ''}`}
            href="#/discovery"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/discovery');
            }}
          >
            <svg>
              <use href="#icon-discovery" />
            </svg>
            <span>{t('nav.discovery')}</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'channels' ? 'active' : ''}`}
            href="#/channels"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/channels');
            }}
          >
            <svg>
              <use href="#icon-channels" />
            </svg>
            <span>{t('nav.channels')}</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'history' ? 'active' : ''}`}
            href="#/history"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/history');
            }}
          >
            <svg>
              <use href="#icon-history" />
            </svg>
            <span>{t('nav.history')}</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'admin' ? 'active' : ''}`}
            href="#/admin"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/admin');
            }}
          >
            <svg>
              <use href="#icon-admin" />
            </svg>
            <span>{t('nav.admin')}</span>
          </a>
        </nav>

        {/* Main Content Area */}
        <main className="content" id="view-content">
          {route.page === 'discovery' && <DiscoveryView />}
          {route.page === 'channels' && <ChannelsView />}
          {route.page === 'channel' && route.param && <ChannelDetailView channelId={route.param} />}
          {route.page === 'video' && route.param && <VideoWatchView videoId={route.param} />}
          {route.page === 'history' && <HistoryView />}
          {route.page === 'admin' && <AdminView />}
          {!['discovery', 'channels', 'channel', 'video', 'history', 'admin'].includes(route.page) && (
            <DiscoveryView />
          )}
        </main>

        {/* Mobile Bottom Navigation (<900px) */}
        <nav className="bottom-nav" id="bottom-nav">
          <a
            className={`nav-item ${activeNav === 'discovery' ? 'active' : ''}`}
            href="#/discovery"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/discovery');
            }}
          >
            <svg>
              <use href="#icon-discovery" />
            </svg>
            <span>{t('nav.discovery')}</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'channels' ? 'active' : ''}`}
            href="#/channels"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/channels');
            }}
          >
            <svg>
              <use href="#icon-channels" />
            </svg>
            <span>{t('nav.channels')}</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'history' ? 'active' : ''}`}
            href="#/history"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/history');
            }}
          >
            <svg>
              <use href="#icon-history" />
            </svg>
            <span>{t('nav.history')}</span>
          </a>
          <a
            className={`nav-item ${activeNav === 'admin' ? 'active' : ''}`}
            href="#/admin"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('#/admin');
            }}
          >
            <svg>
              <use href="#icon-admin" />
            </svg>
            <span>{t('nav.admin')}</span>
          </a>
        </nav>
      </div>

      {/* Floating Toast Notification */}
      <div className={`toast ${toastVisible ? 'visible' : ''}`} id="toast">
        {toastMessage}
      </div>
    </>
  );
}
