declare var process: any;

export interface IEnv {
    FAVICON_URL: string;
    SPREED_URL: string;
}

export const env: IEnv = process.env;
