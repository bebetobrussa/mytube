export interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  watchedAt?: number;
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

export interface BootstrapData {
  settings: AppSettings;
  i18n: {
    locale: string;
    strings: Record<string, string>;
    config: I18nConfig;
  };
  channels: ChannelItem[];
}
