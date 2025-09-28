import React from 'react';
import { Box, Typography, ButtonBase, Grid } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { colorThemes } from '../utils/themes';
import type { ColorTheme } from '../utils/themes';

interface ThemeSelectorProps {
  selectedTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onThemeChange }) => {
  return (
    <Box style={{ marginBottom: '16px', width: '100%', maxWidth: '600px' }}>
      <Grid container spacing={1}>
        {colorThemes.map((theme) => (
          <Grid key={theme.id} size={6}>
            <ButtonBase
              onClick={() => onThemeChange(theme)}
              style={{
                width: '80px',
                height: '60px',
                borderRadius: '8px',
                border: selectedTheme.id === theme.id ? '3px solid #1976d2' : '2px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'stretch',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                padding: 0
              }}
            >
              {/* Left half - Main Color */}
              <Box
                style={{
                  width: '50%',
                  height: '100%',
                  backgroundColor: theme.mainColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minWidth: 0
                }}
              >
                <Typography
                  style={{
                    color: getContrastColor(theme.mainColor),
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  メイン
                </Typography>
              </Box>

              {/* Right half - Sub Color */}
              <Box
                style={{
                  width: '50%',
                  height: '100%',
                  backgroundColor: theme.subColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minWidth: 0
                }}
              >
                <Typography
                  style={{
                    color: getContrastColor(theme.subColor),
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  サブ
                </Typography>
              </Box>

              {/* Check icon for selected theme */}
              {selectedTheme.id === theme.id && (
                <CheckIcon
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    fontSize: '18px',
                    color: '#1976d2',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    padding: '2px',
                    zIndex: 10
                  }}
                />
              )}
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Helper function to determine text color based on background
const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default ThemeSelector;