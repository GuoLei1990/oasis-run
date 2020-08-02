import { UserConfig } from "vite";

const config: UserConfig = {
	minify: true,
	optimizeDeps: {
		exclude: ["@alipay/o3"]
	},
};
export default config;
