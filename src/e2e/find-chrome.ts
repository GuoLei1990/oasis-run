import { exec } from "child_process";

/**
 * 获取 chrome 安装位置
 * @returns chrome 安装路径，若为 null，则没有安装
 */
export function getChromePath(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    exec(`osascript -e 'POSIX path of (path to application "Chrome")'`, (err, stdout) => {
      if (err) {
        resolve(null);
      } else {
        const chromePath = stdout.trim();
        if (chromePath.length === 0) {
          resolve(null);
        } else {
          resolve(chromePath);
        }
      }
    });
  });
}
