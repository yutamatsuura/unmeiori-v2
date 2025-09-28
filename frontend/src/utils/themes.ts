// 鑑定書カラーテーマ定義
export interface ColorTheme {
  id: string;
  mainColor: string;    // メインカラー（重要な見出し）
  subColor: string;     // サブカラー（詳細見出し、アクセント）
  gradient: string;     // グラデーション（既存互換性のため）
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'charcoal',
    mainColor: '#34495e',
    subColor: '#7f8c8d',
    gradient: 'linear-gradient(45deg, #34495e, #7f8c8d)'
  },
  {
    id: 'burgundy-rose',
    mainColor: '#8b1538',
    subColor: '#d4a5a5',
    gradient: 'linear-gradient(45deg, #8b1538, #d4a5a5)'
  },
  {
    id: 'deep-blue',
    mainColor: '#2980b9',
    subColor: '#bdc3c7',
    gradient: 'linear-gradient(45deg, #2980b9, #bdc3c7)'
  },
  {
    id: 'forest',
    mainColor: '#27ae60',
    subColor: '#a9b7a8',
    gradient: 'linear-gradient(45deg, #27ae60, #a9b7a8)'
  },
  {
    id: 'dark-slate',
    mainColor: '#2f3640',
    subColor: '#9ca1aa',
    gradient: 'linear-gradient(45deg, #2f3640, #9ca1aa)'
  },
  {
    id: 'mahogany',
    mainColor: '#8b4513',
    subColor: '#d2b48c',
    gradient: 'linear-gradient(45deg, #8b4513, #d2b48c)'
  },
  {
    id: 'dark-plum',
    mainColor: '#663399',
    subColor: '#b19cd9',
    gradient: 'linear-gradient(45deg, #663399, #b19cd9)'
  },
  {
    id: 'dark-teal',
    mainColor: '#16537e',
    subColor: '#74a0b7',
    gradient: 'linear-gradient(45deg, #16537e, #74a0b7)'
  },
  {
    id: 'olive-sage',
    mainColor: '#5d6b37',
    subColor: '#b8c5a0',
    gradient: 'linear-gradient(45deg, #5d6b37, #b8c5a0)'
  }
];

export const applyTheme = (theme: ColorTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--certificate-primary', theme.mainColor);
  root.style.setProperty('--certificate-secondary', theme.subColor);
  root.style.setProperty('--certificate-gradient', theme.gradient);
};

export const getThemeById = (id: string): ColorTheme | undefined => {
  return colorThemes.find(theme => theme.id === id);
};

export const getDefaultTheme = (): ColorTheme => {
  return colorThemes[0]; // charcoal
};

// フォント選択用の型定義とデータ
export interface FontOption {
  id: string;
  name: string;
  displayName: string;
  fontFamily: string;
}

export const titleFonts: FontOption[] = [
  {
    id: 'mincho',
    name: '明朝体',
    displayName: '明朝体',
    fontFamily: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "MS PMincho", serif'
  },
  {
    id: 'gothic',
    name: 'ゴシック体',
    displayName: 'ゴシック体',
    fontFamily: '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif'
  }
];

export const headingFonts: FontOption[] = [
  {
    id: 'mincho-heading',
    name: '明朝体',
    displayName: '明朝体',
    fontFamily: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "MS PMincho", serif'
  },
  {
    id: 'gothic-heading',
    name: 'ゴシック体',
    displayName: 'ゴシック体',
    fontFamily: '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif'
  }
];

export const bodyFonts: FontOption[] = [
  {
    id: 'mincho-body',
    name: '明朝体',
    displayName: '明朝体',
    fontFamily: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "MS PMincho", serif'
  },
  {
    id: 'gothic-body',
    name: 'ゴシック体',
    displayName: 'ゴシック体',
    fontFamily: '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif'
  }
];

export interface FontSelection {
  title: FontOption;
  heading: FontOption;
  body: FontOption;
}

// フォントサイズ設定用の型定義
export interface FontSizeOption {
  id: string;
  name: string;
  scale: number;
}

export const fontSizeOptions: FontSizeOption[] = [
  { id: 'small', name: '小', scale: 0.85 },
  { id: 'medium', name: '中', scale: 1.0 },
  { id: 'large', name: '大', scale: 1.15 }
];

export interface FontSizeSelection {
  title: FontSizeOption;
  heading: FontSizeOption;
  body: FontSizeOption;
}

export const applyFonts = (fontSelection: FontSelection) => {
  const root = document.documentElement;
  root.style.setProperty('--certificate-font-title', fontSelection.title.fontFamily);
  root.style.setProperty('--certificate-font-heading', fontSelection.heading.fontFamily);
  root.style.setProperty('--certificate-font-body', fontSelection.body.fontFamily);
};

export const applyFontSizes = (fontSizeSelection: FontSizeSelection) => {
  const root = document.documentElement;
  root.style.setProperty('--certificate-font-size-title-scale', fontSizeSelection.title.scale.toString());
  root.style.setProperty('--certificate-font-size-heading-scale', fontSizeSelection.heading.scale.toString());
  root.style.setProperty('--certificate-font-size-body-scale', fontSizeSelection.body.scale.toString());
};

export const getDefaultFontSelection = (): FontSelection => {
  return {
    title: titleFonts[0], // 明朝体
    heading: headingFonts[0], // 明朝体
    body: bodyFonts[1] // ゴシック体
  };
};

export const getDefaultFontSizeSelection = (): FontSizeSelection => {
  const medium = fontSizeOptions[1]; // 中
  return {
    title: medium,
    heading: medium,
    body: medium
  };
};

// 屋号・事業所名と鑑定士名の設定用型定義
export interface CompanyInfo {
  companyName: string;
  appraiserName: string;
}

export const getDefaultCompanyInfo = (): CompanyInfo => {
  return {
    companyName: '',
    appraiserName: ''
  };
};

export const loadCompanyInfo = (): CompanyInfo => {
  try {
    const saved = localStorage.getItem('unmeiori-company-info');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('会社情報の読み込みエラー:', error);
  }
  return getDefaultCompanyInfo();
};

export const saveCompanyInfo = (companyInfo: CompanyInfo): void => {
  try {
    localStorage.setItem('unmeiori-company-info', JSON.stringify(companyInfo));
  } catch (error) {
    console.error('会社情報の保存エラー:', error);
  }
};