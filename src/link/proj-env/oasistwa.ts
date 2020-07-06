import path from "path";
import chalk from "chalk";
import fs from "fs";

function getTWAWebConfig(root: string) {
  return;
}

class OasisTWA {
  private configRelative: string = "app/web/config/config.js";

  private check(root: string) {
    let pkg: object | any;
    pkg = require(path.join(root, "package.json"));
    return pkg.name === "oasistwa";
  }

  private commentExternal(configContent: string): [string, boolean?] {
    const re = configContent.match(`(.+'@alipay/o3': 'window.o3')`);
    let isModify = false;
    if (!re) {
      return [null];
    }
    if (!re[0].trim().startsWith("//")) {
      configContent = configContent.replace(`'@alipay/o3': 'window.o3'`, `// '@alipay/o3': 'window.o3'`);
      isModify = true;
    }

    const re1 = configContent.match(`(.+'https://g.alipay.com/@alipay/o3.+')`);
    if (re1 && !re1[0].trim().startsWith("//")) {
      configContent = configContent.replace(`'https://g.alipay.com/@alipay/o3@2.3.0',`, `// 'https://g.alipay.com/@alipay/o3@2.3.0',`);
      isModify = true;
    }

    return [configContent, isModify];
  }

  modifyExternal(root: string) {
    if (this.check(root)) {
      const configPath = path.join(root, this.configRelative);
      let configContent = fs.readFileSync(configPath, { encoding: "utf-8" });
      const [newContent, isModify] = this.commentExternal(configContent);
      if (!newContent) {
        console.log(chalk.redBright(`[LINK] 没有找到配置文件: ${this.configRelative}`));
        return false;
      } else if (isModify) {
        fs.writeFileSync(configPath, newContent, { encoding: "utf-8" });
      }

      console.log(
        chalk.greenBright(`[SUCCESS] 检查到是 oasistwa 目录，已经注释 external，请查看 ${this.configRelative}`)
      );
      return true;
    }
    return false;
  }
}

export const oasistwa = new OasisTWA();
