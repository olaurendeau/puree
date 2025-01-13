declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLAUDE_API_KEY: string;
    }
  }
}

export {}; 