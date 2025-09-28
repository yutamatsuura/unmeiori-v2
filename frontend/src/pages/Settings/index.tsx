import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Input
} from '@mui/material';
import {
  Save as SaveIcon,
  Logout as LogoutIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { templateAPI, authAPI, getAuthToken } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface TemplateSettings {
  company_name: string;
  admin_email: string;
  auto_save: boolean;
  email_notifications: boolean;
  theme: string;
  logo_url?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<TemplateSettings>({
    company_name: '',
    admin_email: '',
    auto_save: true,
    email_notifications: true,
    theme: 'light'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 認証状態をチェック
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 設定データ取得
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await templateAPI.getSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('設定取得エラー:', error);
      if (error.response?.status === 500) {
        setErrorMessage('設定データの取得に失敗しました。');
      } else {
        setErrorMessage('設定データの取得でエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login', { replace: true });
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      await templateAPI.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('設定保存エラー:', error);
      if (error.response?.status === 400) {
        setErrorMessage('設定データに誤りがあります。');
      } else if (error.response?.status === 500) {
        setErrorMessage('設定の保存に失敗しました。');
      } else {
        setErrorMessage('設定保存でエラーが発生しました。');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('ファイルサイズは5MB以下にしてください。');
      return;
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      setErrorMessage('画像ファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const result = await templateAPI.uploadLogo(file);
      setSettings(prev => ({ ...prev, logo_url: result.logo_url }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('ロゴアップロードエラー:', error);
      if (error.response?.status === 400) {
        setErrorMessage('ロゴファイルの形式が正しくありません。');
      } else {
        setErrorMessage('ロゴのアップロードに失敗しました。');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              設定
            </Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
      </div>
    );
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            設定
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          システム設定
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            設定を保存しました
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              基本設定
            </Typography>

            <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
              <TextField
                label="会社名"
                value={settings.company_name}
                onChange={handleInputChange('company_name')}
                fullWidth
              />

              <TextField
                label="管理者メールアドレス"
                type="email"
                value={settings.admin_email}
                onChange={handleInputChange('admin_email')}
                fullWidth
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              ロゴ設定
            </Typography>

            <Box sx={{ mb: 3 }}>
              {settings.logo_url && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    現在のロゴ
                  </Typography>
                  <img
                    src={settings.logo_url}
                    alt="Company Logo"
                    style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                  />
                </Box>
              )}

              <Input
                type="file"
                onChange={handleLogoUpload}
                disabled={isUploading}
                inputProps={{ accept: 'image/*' }}
                sx={{ display: 'none' }}
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                  disabled={isUploading}
                >
                  {isUploading ? 'アップロード中...' : 'ロゴをアップロード'}
                </Button>
              </label>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              システム設定
            </Typography>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_save}
                    onChange={handleInputChange('auto_save')}
                  />
                }
                label="自動保存を有効にする"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email_notifications}
                    onChange={handleInputChange('email_notifications')}
                  />
                }
                label="メール通知を有効にする"
              />
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '設定を保存'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default SettingsPage;