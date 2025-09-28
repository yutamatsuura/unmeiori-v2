import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid
} from '@mui/material';
import type { CompanyInfo } from '../utils/themes';

interface CompanyInfoSettingsProps {
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (companyInfo: CompanyInfo) => void;
}

const CompanyInfoSettings: React.FC<CompanyInfoSettingsProps> = ({ companyInfo, onCompanyInfoChange }) => {
  const handleChange = (field: keyof CompanyInfo, value: string) => {
    const newCompanyInfo = {
      ...companyInfo,
      [field]: value
    };
    onCompanyInfoChange(newCompanyInfo);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#666' }}>
            屋号・事業所名
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={companyInfo.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="例：運命織事務所"
            inputProps={{ maxLength: 50 }}
            sx={{ mb: 1 }}
          />
        </Grid>
        <Grid size={12}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#666' }}>
            鑑定士名
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={companyInfo.appraiserName}
            onChange={(e) => handleChange('appraiserName', e.target.value)}
            placeholder="例：山田太郎"
            inputProps={{ maxLength: 30 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyInfoSettings;