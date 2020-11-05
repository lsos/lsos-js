import { ExpirationDates } from "../postinstall/getExpirationDates";
import { envData } from "./envData";

export { getEnv };

export type Env =
  | undefined
  | {
      cwd: string;
      repo: {
        isPublic: null | boolean;
        numberOfAuthors: null | number;
        repoUrl: null | string;
        orgName: null | string;
        repoName: null | string;
      };
      activation: {
        expirationDates: ExpirationDates;
      };
    };

function getEnv(): Env {
  return envData;
}
