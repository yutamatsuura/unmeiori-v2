# sindankanteiデザインシステム定義書

## 基本情報
- **プロジェクト名**: sindankantei（鑑定書楽々作成ツール）
- **テーマ名**: プロフェッショナルテーマ
- **作成日**: 2025-08-31
- **バージョン**: 1.0.0
- **フレームワーク**: MUI v5 (Material-UI)

## デザインコンセプト
プロフェッショナルテーマは、ビジネスライクな信頼性と企業向け鑑定対応に最適化されたデザインシステムです。紺色をメインカラーとした落ち着いた色調で、プロ鑑定士や企業向け鑑定サービス提供者が安心して使用できる、格式高い鑑定書作成環境を提供します。

九星気学・姓名判断という伝統的な分野にふさわしい、権威と信頼を象徴するTimesフォントと、シンプルで美しいインターフェースの調和を実現。ユーザーが集中して鑑定業務に取り組める、プロフェッショナルな環境を構築しています。

## MUI v5 テーマ設定

### createTheme設定

```javascript
import { createTheme } from '@mui/material/styles';
import { Noto_Serif_JP } from 'next/font/google';

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const theme = createTheme({
  palette: {
    primary: {
      main: '#34495e',        // 紺色（メイン）
      light: '#566573',       // 薄紺色
      dark: '#2c3e50',        // 濃紺色
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#bdc3c7',        // シルバー（サブ）
      light: '#d5dbdb',       // 薄シルバー
      dark: '#85929e',        // 濃シルバー
      contrastText: '#2c3e50',
    },
    success: {
      main: '#16a085',        // 深緑（アクセント）
      light: '#48c9b0',       // 薄深緑
      dark: '#138d75',        // 濃深緑
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f39c12',        // オレンジ
      light: '#f8c471',       // 薄オレンジ
      dark: '#d68910',        // 濃オレンジ
      contrastText: '#2c3e50',
    },
    error: {
      main: '#e74c3c',        // 赤
      light: '#ec7063',       // 薄赤
      dark: '#c0392b',        // 濃赤
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',     // 白（ベース）
      paper: '#fafbfc',       // 微灰白
    },
    text: {
      primary: '#2c3e50',     // メインテキスト
      secondary: '#566573',   // サブテキスト
      disabled: '#bdc3c7',    // 無効テキスト
    },
  },
  typography: {
    fontFamily: [
      '"Times New Roman"',
      notoSerifJP.style.fontFamily,
      'serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2c3e50',
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#34495e',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#34495e',
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#566573',
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#566573',
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      color: '#2c3e50',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#566573',
      lineHeight: 1.7,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#85929e',
      lineHeight: 1.5,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(52, 73, 94, 0.1)',
    '0 4px 8px rgba(52, 73, 94, 0.12)',
    '0 8px 16px rgba(52, 73, 94, 0.14)',
    '0 12px 24px rgba(52, 73, 94, 0.16)',
    ...Array(20).fill('0 16px 32px rgba(52, 73, 94, 0.18)'),
  ],
});
```

## カラーパレット

### プライマリカラー（紺色系）
- **Main**: `#34495e` - メインアクション、ヘッダー、重要な要素
- **Light**: `#566573` - ホバー状態、サブ要素
- **Dark**: `#2c3e50` - アクティブ状態、強調

### セカンダリカラー（シルバー系）
- **Main**: `#bdc3c7` - セカンダリボタン、境界線
- **Light**: `#d5dbdb` - 無効状態、薄い背景
- **Dark**: `#85929e` - テキスト、アイコン

### アクセントカラー（深緑系）
- **Success**: `#16a085` - 成功状態、完了アクション
- **Light**: `#48c9b0` - 成功メッセージ背景
- **Dark**: `#138d75` - 成功ボタンのホバー

### セマンティックカラー
- **Warning**: `#f39c12` - 警告、注意事項
- **Error**: `#e74c3c` - エラー、削除アクション
- **Background**: `#ffffff` - ページ背景
- **Paper**: `#fafbfc` - カード、パネル背景

## タイポグラフィ

### フォントファミリー
- **英語**: Times New Roman
- **日本語**: Noto Serif JP
- **フォールバック**: serif

### フォントサイズスケール
- **H1**: 40px (2.5rem) - ページタイトル
- **H2**: 32px (2rem) - セクションタイトル
- **H3**: 24px (1.5rem) - サブセクション
- **H4**: 20px (1.25rem) - カードタイトル
- **H5**: 16px (1rem) - ラベル
- **H6**: 14px (0.875rem) - 小見出し
- **Body1**: 16px (1rem) - 本文
- **Body2**: 14px (0.875rem) - 補助テキスト
- **Caption**: 12px (0.75rem) - キャプション

## スペーシング

MUIのspacingは8px基準（theme.spacing(1) = 8px）

```javascript
const spacing = {
  xs: 4,     // theme.spacing(0.5)
  sm: 8,     // theme.spacing(1)
  md: 16,    // theme.spacing(2)
  lg: 24,    // theme.spacing(3)
  xl: 32,    // theme.spacing(4)
  xxl: 48,   // theme.spacing(6)
};
```

## コンポーネントスタイル

### ボタン

```javascript
// Primary Button
<Button variant="contained" color="primary">
  メインアクション
</Button>

// Secondary Button
<Button variant="outlined" color="primary">
  セカンダリアクション
</Button>

// Success Button
<Button variant="contained" color="success">
  保存・完了
</Button>

// Text Button
<Button variant="text" color="primary">
  キャンセル
</Button>
```

### カード

```javascript
<Card sx={{ 
  boxShadow: 1,
  borderRadius: 2,
  '&:hover': { boxShadow: 2 }
}}>
  <CardContent sx={{ p: 3 }}>
    <Typography variant="h4" component="h2" gutterBottom>
      カードタイトル
    </Typography>
    <Typography variant="body1" color="text.secondary">
      カード内容
    </Typography>
  </CardContent>
</Card>
```

### フォーム要素

```javascript
// Text Field
<TextField
  label="入力項目"
  variant="outlined"
  fullWidth
  sx={{ mb: 2 }}
/>

// Select
<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>選択項目</InputLabel>
  <Select label="選択項目">
    <MenuItem value="option1">選択肢1</MenuItem>
    <MenuItem value="option2">選択肢2</MenuItem>
  </Select>
</FormControl>
```

### アラート

```javascript
// Success Alert
<Alert severity="success" sx={{ mb: 2 }}>
  鑑定書が正常に保存されました
</Alert>

// Warning Alert
<Alert severity="warning" sx={{ mb: 2 }}>
  入力内容を確認してください
</Alert>

// Error Alert
<Alert severity="error" sx={{ mb: 2 }}>
  エラーが発生しました
</Alert>
```

## レイアウト

### コンテナ設定

```javascript
<Container maxWidth="lg" sx={{ py: 4 }}>
  {/* メインコンテンツ */}
</Container>
```

### グリッドシステム

```javascript
<Grid container spacing={3}>
  <Grid item xs={12} md={8}>
    <Paper sx={{ p: 3 }}>
      メインコンテンツ
    </Paper>
  </Grid>
  <Grid item xs={12} md={4}>
    <Paper sx={{ p: 3 }}>
      サイドバーコンテンツ
    </Paper>
  </Grid>
</Grid>
```

## ナビゲーション構造

### AppBar（ヘッダー）

```javascript
<AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
  <Toolbar>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      sindankantei
    </Typography>
    <Button color="inherit">ログアウト</Button>
  </Toolbar>
</AppBar>
```

### サイドバー（Drawer）

```javascript
<Drawer
  variant="permanent"
  sx={{
    width: 280,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 280,
      boxSizing: 'border-box',
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'secondary.light',
    },
  }}
>
  <List>
    <ListItem disablePadding>
      <ListItemButton selected>
        <ListItemIcon>
          <DashboardIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="ダッシュボード" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <AssessmentIcon />
        </ListItemIcon>
        <ListItemText primary="鑑定書作成" />
      </ListItemButton>
    </ListItem>
  </List>
</Drawer>
```

## レスポンシブ対応

### ブレークポイント
- **xs**: 0px - モバイル
- **sm**: 600px - タブレット縦
- **md**: 900px - タブレット横・小型PC
- **lg**: 1200px - デスクトップ
- **xl**: 1536px - 大型デスクトップ

### レスポンシブサイドバー

```javascript
const [mobileOpen, setMobileOpen] = useState(false);

// モバイル用一時的Drawer
<Drawer
  variant="temporary"
  open={mobileOpen}
  onClose={() => setMobileOpen(false)}
  ModalProps={{ keepMounted: true }}
  sx={{
    display: { xs: 'block', sm: 'none' },
    '& .MuiDrawer-paper': { width: 280 },
  }}
>
  {/* サイドバーコンテンツ */}
</Drawer>

// デスクトップ用固定Drawer
<Drawer
  variant="permanent"
  sx={{
    display: { xs: 'none', sm: 'block' },
    width: 280,
  }}
>
  {/* サイドバーコンテンツ */}
</Drawer>
```

## アニメーション

### Transition設定

```javascript
// Fade Transition
<Fade in={open} timeout={300}>
  <Paper>コンテンツ</Paper>
</Fade>

// Slide Transition
<Slide direction="up" in={open} mountOnEnter unmountOnExit>
  <Alert>メッセージ</Alert>
</Slide>
```

## アクセシビリティ

### 基本設定
- **コントラスト比**: WCAG AA準拠（4.5:1以上）
- **フォーカス**: 明確なフォーカスインジケーター
- **キーボード操作**: 全機能キーボードアクセス可能
- **スクリーンリーダー**: aria-labelによる適切な説明

### 実装例

```javascript
<Button
  aria-label="鑑定書を保存"
  aria-describedby="save-help-text"
>
  保存
</Button>
<Typography id="save-help-text" variant="caption">
  Ctrl+Sでも保存できます
</Typography>
```

## 実装ガイド

### 1. テーマプロバイダーの設定

```javascript
// _app.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../styles/theme';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### 2. レイアウトコンポーネント

```javascript
// components/Layout.tsx
export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        {/* ヘッダー */}
      </AppBar>
      <Drawer variant="permanent">
        {/* サイドバー */}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
```

### 3. 共通コンポーネント例

```javascript
// components/PageHeader.tsx
export function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h1">{title}</Typography>
        {action}
      </Box>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}
```

## 更新履歴

### v1.0.0 (2025-08-31)
- 初版リリース
- プロフェッショナルテーマ定義
- MUI v5対応
- レスポンシブデザイン対応
- アクセシビリティ基準準拠

## 注意事項

1. **フォント読み込み**: Next.jsのnext/fontを使用してNoto Serif JPを適切に読み込んでください
2. **パフォーマンス**: 大きなコンポーネントは動的インポートを検討してください
3. **カスタマイズ**: テーマの変更は`theme.ts`ファイルで一元管理してください
4. **ダークモード**: 将来的な対応のため、色指定は必ずtheme.palette経由で行ってください
5. **アクセシビリティ**: 新しいコンポーネント作成時は必ずaria-*属性を適切に設定してください