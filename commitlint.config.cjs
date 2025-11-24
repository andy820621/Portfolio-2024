// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 限制 type 清單（可以照你中文說明那套）
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能
        'fix', // 修復錯誤
        'docs', // 文件異動
        'style', // 程式碼格式調整、樣式修改
        'refactor', // 程式碼重構
        'perf', // 效能最佳化
        'test', // 測試相關
        'build', // 建置相關
        'ci', // CI 相關
        'revert', // 撤銷提交
        'chore', // 雜項任務
      ],
    ],
  },
}
