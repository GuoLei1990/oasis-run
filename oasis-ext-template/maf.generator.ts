import { Generator } from '@alipay/maf-types';

//@ts-ignore
export default Generator({
  prompts() {
    return [
      {
        name: 'name',
        message: '新项目的名字',
        default: this.outFolder,
        filter: val => val.toLowerCase()
      },
      {
        name: 'description',
        message: '描述你的项目',
        default: `my awesome project`
      },
      {
        name: 'username',
        message: '你的 Gitlab 用户名',
        default: this.gitUser.name,
        store: true
      },
      {
        name: 'email',
        message: '你的 Gitlab 的邮箱？',
        default: this.gitUser.email,
        store: true,
        validate: v => /.+@.+/.test(v)
      },
      {
        name: 'group',
        message: '你的部门？',
        default: 'Ant Financial',
        store: true
      }
    ]
  },
  actions: [
    {
      type: 'add',
      files: '**',
      transformExclude: 'template/**'
    },
    {
      type: 'move',
      patterns: {
        gitignore: '.gitignore',
        // If we use `package.json` directly
        // Then `template` folder will be treated as a package too, which isn't safe
        '_package.json': 'package.json',
        '_tsconfig.json': 'tsconfig.json',
        'eslintrc.js': '.eslintrc.js',
        'prettierrc.js': '.prettierrc.js'
      }
    }
  ],
  async completed() {
    await this.showProjectTips()
    await this.npmInstallWithPrompt()
  }
})
