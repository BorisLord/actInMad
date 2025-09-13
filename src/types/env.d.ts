interface ImportMetaEnv {
  readonly PUBLIC_PB_URL: string;
  readonly PB_BUILDER_EMAIL: string;
  readonly PB_BUILDER_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
