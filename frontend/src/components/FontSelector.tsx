import React from 'react';
import {
  Box,
  Typography,
  Grid,
  ButtonBase
} from '@mui/material';
import type { FontOption, FontSelection, FontSizeOption, FontSizeSelection } from '../utils/themes';
import { titleFonts, headingFonts, bodyFonts, fontSizeOptions } from '../utils/themes';

interface FontSelectorProps {
  fontSelection: FontSelection;
  onFontChange: (fontSelection: FontSelection) => void;
  fontSizeSelection: FontSizeSelection;
  onFontSizeChange: (fontSizeSelection: FontSizeSelection) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ fontSelection, onFontChange, fontSizeSelection, onFontSizeChange }) => {
  const handleFontChange = (category: 'title' | 'heading' | 'body', font: FontOption) => {
    const newSelection = {
      ...fontSelection,
      [category]: font
    };
    onFontChange(newSelection);
  };

  const handleFontSizeChange = (category: 'title' | 'heading' | 'body', fontSize: FontSizeOption) => {
    const newSelection = {
      ...fontSizeSelection,
      [category]: fontSize
    };
    onFontSizeChange(newSelection);
  };

  const FontCategorySelector: React.FC<{
    title: string;
    fonts: FontOption[];
    selectedFont: FontOption;
    selectedFontSize: FontSizeOption;
    category: 'title' | 'heading' | 'body';
  }> = ({ title, fonts, selectedFont, selectedFontSize, category }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {title}
      </Typography>

      {/* フォント選択とサイズ選択を横並びに */}
      <Grid container spacing={1}>
        {/* フォント選択（左側） */}
        <Grid size={8}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#666' }}>
            フォント
          </Typography>
          <Grid container spacing={0.5}>
            {fonts.map((font) => (
              <Grid key={font.id} size={6}>
                <ButtonBase
                  onClick={() => handleFontChange(category, font)}
                  sx={{
                    width: '100%',
                    height: '45px',
                    border: selectedFont.id === font.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedFont.id === font.id ? '#f5f5f5' : 'white',
                    '&:hover': {
                      backgroundColor: '#f9f9f9'
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: font.fontFamily,
                      fontSize: '13px',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {font.displayName}
                  </Typography>
                </ButtonBase>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* フォントサイズ選択（右側） */}
        <Grid size={4}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#666' }}>
            サイズ
          </Typography>
          <Grid container spacing={0.5}>
            {fontSizeOptions.map((fontSize) => (
              <Grid key={fontSize.id} size={12}>
                <ButtonBase
                  onClick={() => handleFontSizeChange(category, fontSize)}
                  sx={{
                    width: '100%',
                    height: '35px',
                    border: selectedFontSize.id === fontSize.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedFontSize.id === fontSize.id ? '#f5f5f5' : 'white',
                    '&:hover': {
                      backgroundColor: '#f9f9f9'
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '12px',
                      textAlign: 'center',
                      fontWeight: selectedFontSize.id === fontSize.id ? 'bold' : 'normal'
                    }}
                  >
                    {fontSize.name}
                  </Typography>
                </ButtonBase>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>

      <FontCategorySelector
        title="タイトル（総合鑑定書など）"
        fonts={titleFonts}
        selectedFont={fontSelection.title}
        selectedFontSize={fontSizeSelection.title}
        category="title"
      />

      <FontCategorySelector
        title="見出し（セクション見出しなど）"
        fonts={headingFonts}
        selectedFont={fontSelection.heading}
        selectedFontSize={fontSizeSelection.heading}
        category="heading"
      />

      <FontCategorySelector
        title="本文（詳細テキストなど）"
        fonts={bodyFonts}
        selectedFont={fontSelection.body}
        selectedFontSize={fontSizeSelection.body}
        category="body"
      />
    </Box>
  );
};

export default FontSelector;