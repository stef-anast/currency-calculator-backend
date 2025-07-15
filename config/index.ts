interface Config {
  port: number;
  databaseUri: string;
  accessTokenSecret: string;
  accessTokenExp: string;
  refreshTokenSecret: string;
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

const validateRequiredEnvVar = (
  name: string,
  value: string | undefined
): string => {
  if (!value || value.trim() === '') {
    throw new ConfigError(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const validateOptionalEnvVar = (
  name: string,
  value: string | undefined,
  defaultValue: string
): string => {
  if (!value || value.trim() === '') {
    console.warn(`Warning: ${name} not set, using default: ${defaultValue}`);
    return defaultValue;
  }
  return value.trim();
};

const loadConfig = (): Config => {
  try {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      databaseUri: validateRequiredEnvVar(
        'DATABASE_URI',
        process.env.DATABASE_URI
      ),
      accessTokenSecret: validateRequiredEnvVar(
        'ACCESS_TOKEN_SECRET',
        process.env.ACCESS_TOKEN_SECRET
      ),
      accessTokenExp: validateOptionalEnvVar(
        'ACCESS_TOKEN_EXP',
        process.env.ACCESS_TOKEN_EXP,
        '15m'
      ),
      refreshTokenSecret: validateRequiredEnvVar(
        'REFRESH_TOKEN_SECRET',
        process.env.REFRESH_TOKEN_SECRET
      ),
    };
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('Configuration Error:', error.message);
      console.error(
        'Please check your .env file and ensure all required variables are set.'
      );
      process.exit(1);
    }
    throw error;
  }
};

export const config = loadConfig();
export { ConfigError };
