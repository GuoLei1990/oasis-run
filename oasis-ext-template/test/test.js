const path = require('path')
const maf = require('@alipay/maf')

const generator = path.join(__dirname, '..')

test('defaults', async () => {
  const stream = await maf.run({ generator }, {
    // pass mocked prompt anwsers here.
  })
  expect(stream.fileList).toMatchSnapshot()
})
