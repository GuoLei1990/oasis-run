import YuyanMonitor from "@alipay/yuyan-monitor-node";
import os from "os";

class Monitor {
  private bmId = "5f4de19dbb4823cd3415d4c5";
  private yuyanMonitor = new YuyanMonitor({
    _appId: this.bmId
  });

  public logLinkPV() {
    this.log(5, { d1: os.userInfo()?.username });
  }

  public logCreatePV() {
    this.log(6, { d1: os.userInfo()?.username });
  }

  private log(code: number, options: { [key: string]: any; msg?: string } = {}) {
    this.yuyanMonitor.log({
      code: code, // 监控项代码，必填
      ...options
      // msg: optionsmsg,    // 上报消息，用来做上报信息列表的聚类，建议上报此字段
      //             // 因为要做聚类，所以 msg 字段的内容要收敛
      // d1: 'd1',   // d1 ~ d8 为自定义维度字段，与监控项配置的字段有关
      // m1: 123,    // m1 ~ m8 为自定义指标字段，与监控项配置的字段有关，类型是 number
    });
  }
}

export const monitor = new Monitor();
