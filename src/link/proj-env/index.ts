import { oasistwa } from "./oasistwa";

interface ProjEnv {
  modifyExternal(root: string): boolean;
}

export const projectEnvs: ProjEnv[] = [oasistwa];
