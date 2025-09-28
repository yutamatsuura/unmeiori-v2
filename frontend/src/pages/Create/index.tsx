import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Chip,
  FormHelperText
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { kanteiAPI, authAPI, getAuthToken, kyuseiKigakuAPI, seimeiHandanAPI } from '../../services/api';
import './styles.css';

interface FormData {
  surname: string;
  givenName: string;
  birthDate: string;
  gender: string;
  email: string;
}

interface FormErrors {
  [key: string]: string;
}


interface CalculationResult {
  id?: number;
  seimei_result?: {
    total?: number;
    heaven?: number;
    earth?: number;
    personality?: number;
    original_response?: {
      data?: {
        grade?: string;
        overallScore?: number;
        [key: string]: any;
      };
    };
    [key: string]: any;
  } | null;
  combined_result?: {
    summary?: string;
    overall_fortune?: string;
    [key: string]: any;
  } | null;
}

const CreatePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    surname: '松浦',
    givenName: '悠太',
    birthDate: '1980-01-01',
    gender: 'male',
    email: 'test@example.com'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // 認証状態をチェック（Phase 1.5では無効化）
  // useEffect(() => {
  //   const token = getAuthToken();
  //   if (!token) {
  //     navigate('/login', { replace: true });
  //   }
  // }, [navigate]);

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login', { replace: true });
  };

  const handleGoToHistory = () => {
    navigate('/history');
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }
  ) => {
    const value = event.target.value as string;
    setFormData(prev => ({ ...prev, [field]: value }));

    // エラーメッセージをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // リアルタイムバリデーション（メールアドレスは非表示のためスキップ）
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 姓のバリデーション
    if (!formData.surname.trim()) {
      newErrors.surname = '姓を入力してください';
    } else if (formData.surname.trim().length < 1) {
      newErrors.surname = '姓は1文字以上で入力してください';
    }

    // 名のバリデーション
    if (!formData.givenName.trim()) {
      newErrors.givenName = '名を入力してください';
    } else if (formData.givenName.trim().length < 1) {
      newErrors.givenName = '名は1文字以上で入力してください';
    }

    // 生年月日のバリデーション
    if (!formData.birthDate) {
      newErrors.birthDate = '生年月日を入力してください';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const minDate = new Date(1900, 0, 1);

      if (birthDate > today) {
        newErrors.birthDate = '生年月日は今日以前の日付を入力してください';
      } else if (birthDate < minDate) {
        newErrors.birthDate = '生年月日は1900年以降の日付を入力してください';
      }
    }

    // 性別のバリデーション
    if (!formData.gender) {
      newErrors.gender = '性別を選択してください';
    }

    // メールアドレスのバリデーション（非表示のため常にtest@example.comを使用）
    // バリデーションスキップ

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    // バリデーション実行とログ出力
    const isValid = validateForm();
    if (!isValid) {
      console.log('バリデーションエラー:', errors);
      setErrorMessage('入力内容に誤りがあります。エラーメッセージを確認して修正してください。');
      return;
    }

    setIsCalculating(true);
    setErrorMessage('');
    setShowSuccess(false);

    try {
      // Phase 1.5: マイクロサービス直接呼び出し
      const kanteiRequest = {
        client_info: {
          surname: formData.surname,
          given_name: formData.givenName,
          birth_date: formData.birthDate,
          gender: formData.gender,
          email: formData.email
        }
      };

      console.log('Phase 1.5: マイクロサービス直接呼び出し開始:', kanteiRequest);

      // 九星気学計算（正しいフォーマット）
      const kyuseiData = {
        birthDate: formData.birthDate,
        currentDate: new Date().toISOString().split('T')[0]
      };
      const kyuseiResult = await kyuseiKigakuAPI.calculate(kyuseiData);
      console.log('九星気学結果:', kyuseiResult);

      // 姓名判断計算（正しいフォーマット）
      const seimeiRequest = {
        sei: formData.surname,
        mei: formData.givenName
      };
      const seimeiResult = await seimeiHandanAPI.calculate(seimeiRequest);
      console.log('姓名判断結果:', seimeiResult);

      // 結果統合（姓名判断の実際のデータ構造に対応）
      // 姓名判断APIは {success: true, data: {...}} を返すので、
      // Previewページで期待される形式に変換
      const seimeiData = seimeiResult.data || seimeiResult;
      // Phase 1.5: 簡易的な連番ID生成（1-999の範囲）
      const simpleId = Math.floor(Math.random() * 999) + 1;
      const result = {
        id: simpleId, // 簡易的な3桁ID
        kyusei_result: kyuseiResult,
        seimei_result: {
          total: seimeiData.kakusu?.soukaku,
          heaven: seimeiData.kakusu?.tenkaku,
          earth: seimeiData.kakusu?.chikaku,
          personality: seimeiData.kakusu?.jinkaku,
          original_response: {
            data: seimeiData
          }
        },
        combined_result: {
          summary: '九星気学と姓名判断の結果が完了しました',
          overall_fortune: '運勢良好'
        }
      };

      console.log('Phase 1.5 統合結果:', result);
      setCalculationResult(result);
      setShowSuccess(true);

      // 実際のIDでプレビューページに遷移
      const kanteiId = result.id;
      if (kanteiId) {
        navigate(`/preview/${kanteiId}`, {
          state: { formData, calculationResult: result }
        });
      } else {
        throw new Error('鑑定IDが取得できませんでした');
      }
    } catch (error: any) {
      console.error('計算エラー:', error);

      // エラータイプに応じた詳細なメッセージ表示
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.detail) {
          setErrorMessage(`入力エラー: ${errorData.detail}`);
        } else {
          setErrorMessage('入力データに誤りがあります。姓、名、生年月日、性別の内容を確認してください。');
        }
      } else if (error.response?.status === 401) {
        setErrorMessage('認証が無効です。再度ログインしてください。');
        // 必要に応じてログイン画面にリダイレクト
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 422) {
        setErrorMessage('入力データの形式が正しくありません。全ての必須項目を正しく入力してください。');
      } else if (error.response?.status === 500) {
        setErrorMessage('サーバー内部エラーが発生しました。時間をおいて再度お試しいただくか、管理者にお問い合わせください。');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        setErrorMessage('サーバーに接続できません。インターネット接続を確認するか、管理者にお問い合わせください。');
      } else if (error.name === 'TimeoutError') {
        setErrorMessage('処理がタイムアウトしました。もう一度お試しください。');
      } else {
        // その他のエラー
        const errorMsg = error.message || '不明なエラー';
        setErrorMessage(`計算処理でエラーが発生しました: ${errorMsg}。もう一度お試しください。`);
      }
    } finally {
      setIsCalculating(false);
    }
  };


  return (
    <div className="create-page">
      {/* ヘッダー */}
      <AppBar position="static" className="header">
        <Toolbar>
          {/* ロゴマーク */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ marginRight: '4px' }}>
              {/* 外側の八角形（九星気学の方位盤をイメージ） */}
              <polygon
                points="12,2 20,2 30,12 30,20 20,30 12,30 2,20 2,12"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* 内側の円（中宮をイメージ） */}
              <circle
                cx="16"
                cy="16"
                r="8"
                fill="rgba(255,255,255,0.1)"
                stroke="white"
                strokeWidth="1"
              />
              {/* 中央の漢字風デザイン（運命織の「織」をイメージ） */}
              <g fill="white" opacity="0.9">
                {/* 縦線 */}
                <rect x="15" y="8" width="2" height="16" />
                {/* 横線1 */}
                <rect x="10" y="11" width="12" height="1.5" />
                {/* 横線2 */}
                <rect x="10" y="15" width="12" height="1.5" />
                {/* 横線3 */}
                <rect x="10" y="19" width="12" height="1.5" />
                {/* 斜め線（織りをイメージ） */}
                <rect x="11" y="12" width="1" height="10" transform="rotate(15 11.5 17)" />
                <rect x="20" y="12" width="1" height="10" transform="rotate(-15 20.5 17)" />
              </g>
              {/* 装飾的な点（九星をイメージ） */}
              <circle cx="8" cy="8" r="1" fill="white" opacity="0.6" />
              <circle cx="24" cy="8" r="1" fill="white" opacity="0.6" />
              <circle cx="24" cy="24" r="1" fill="white" opacity="0.6" />
              <circle cx="8" cy="24" r="1" fill="white" opacity="0.6" />
            </svg>
          </Box>
          <Typography variant="h6" component="h1" className="header-title">
            運命織
          </Typography>
          <Typography variant="subtitle1" className="header-subtitle" sx={{ flexGrow: 1 }}>
            鑑定書作成システム
          </Typography>
          <Button
            color="inherit"
            onClick={handleGoToHistory}
            startIcon={<HistoryIcon />}
            sx={{ mr: 1 }}
          >
            履歴
          </Button>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Box className="main-container" sx={{ width: '100vw', maxWidth: 'none', margin: 0, padding: '32px 24px' }}>
        <Box className="page-header">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Box sx={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #34495e 50%, transparent 100%)',
              mr: 3
            }} />
            <Typography variant="h4" component="h2" className="page-title" sx={{
              position: 'relative',
              letterSpacing: '0.1em',
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '2px',
                background: 'linear-gradient(90deg, #16a085, #138d75)',
                borderRadius: '1px'
              }
            }}>
              鑑定書作成
            </Typography>
            <Box sx={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #34495e 50%, transparent 100%)',
              ml: 3
            }} />
          </Box>
          <Typography variant="subtitle1" className="page-description" sx={{ mt: 3 }}>
            ご依頼者の情報を入力して鑑定を開始します
          </Typography>
        </Box>

        <div className="content-layout" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%'
        }}>
          {/* 入力フォームセクション */}
          <Card className="form-section" style={{width: '100%', maxWidth: '600px'}}>
            <CardContent>
              <Box className="section-header">
                <PersonIcon />
                <Typography variant="h6">ご依頼者の情報入力</Typography>
              </Box>

              {showSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  鑑定計算が完了しました！結果をご確認ください。
                </Alert>
              )}

              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  data-testid="error-message"
                >
                  {errorMessage}
                </Alert>
              )}

              {/* 姓・名フィールド */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="姓"
                    data-testid="surname-input"
                    value={formData.surname}
                    onChange={handleInputChange('surname')}
                    error={!!errors.surname}
                    helperText={errors.surname}
                    variant="outlined"
                    required
                    placeholder="例: 松浦"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="名"
                    data-testid="givenname-input"
                    value={formData.givenName}
                    onChange={handleInputChange('givenName')}
                    error={!!errors.givenName}
                    helperText={errors.givenName}
                    variant="outlined"
                    required
                    placeholder="例: 悠太"
                  />
                </Box>
              </Box>

              <Box className="form-group">
                <TextField
                  fullWidth
                  label="生年月日"
                  type="date"
                  data-testid="birthdate-input"
                  value={formData.birthDate}
                  onChange={handleInputChange('birthDate')}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>

              <Box className="form-group">
                <FormControl fullWidth error={!!errors.gender} required>
                  <InputLabel id="gender-label">性別</InputLabel>
                  <Select
                    labelId="gender-label"
                    data-testid="gender-select"
                    value={formData.gender}
                    onChange={handleInputChange('gender')}
                    label="性別"
                  >
                    <MenuItem value="male" data-testid="gender-male">男性</MenuItem>
                    <MenuItem value="female" data-testid="gender-female">女性</MenuItem>
                  </Select>
                  {errors.gender && (
                    <FormHelperText error data-testid="gender-error">
                      {errors.gender}
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* メールアドレスフィールドを非表示（test@example.comを自動使用）*/}

              <Button
                className="generate-btn"
                variant="contained"
                data-testid="calculate-button"
                onClick={handleCalculate}
                disabled={isCalculating}
                startIcon={isCalculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                fullWidth
                size="large"
              >
                {isCalculating ? '計算中...' : '鑑定計算実行'}
              </Button>
            </CardContent>
          </Card>

        </div>
      </Box>
    </div>
  );
};

export default CreatePage;