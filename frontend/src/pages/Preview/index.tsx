import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Card,
  CardContent,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Drawer,
  TextField
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as BackIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  ChevronLeft as ChevronLeftIcon,
  Palette as PaletteIcon,
  FontDownload as FontIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { kanteiAPI, authAPI, getAuthToken } from '../../services/api';
import KyuseiHoiban from '../../components/KyuseiHoiban';
import PrintPreviewMode from '../../components/PrintPreview/PrintPreviewMode';
import ThemeSelector from '../../components/ThemeSelector';
import FontSelector from '../../components/FontSelector';
import CompanyInfoSettings from '../../components/CompanyInfoSettings';
import type { FontSelection, ColorTheme, FontSizeSelection, CompanyInfo } from '../../utils/themes';
import { colorThemes, applyTheme, getDefaultTheme, applyFonts, getDefaultFontSelection, getDefaultFontSizeSelection, applyFontSizes, loadCompanyInfo, saveCompanyInfo } from '../../utils/themes';
import '../../styles/certificate-shared.css';
import './styles.css';

// カラーテーマの型定義（削除: 既にthemes.tsからインポート済み）

// 詳細解説の型定義
interface YouinExplanation {
  key: string;
  name: string;
  description: string;
}

interface GogyouExplanation {
  combination: string;
  description: string;
}

interface KakusuExplanation {
  number: number;
  type: '大吉' | '吉' | '半吉' | '平' | '凶' | '大凶';
  meaning: string;
  description: string;
}

interface KanteiData {
  category: string;
  score: number;
  message: string;
  details?: string;
  detailedExplanation?: {
    kakusu?: KakusuExplanation;
    meaning?: string;
    advice?: string;
  };
}

interface CharacterInfo {
  character: string;
  strokeCount: number;
  reading: string;
  gogyou: string;
  youin: string;
  meaning?: string;
  isBunri?: boolean;
  detailedExplanation?: {
    youin?: YouinExplanation;
    gogyou?: GogyouExplanation;
    kakusu?: KakusuExplanation;
  };
}

interface LocationState {
  formData?: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
    birthPlace: string;
    email: string;
  };
  calculationResult?: {
    kyusei_kigaku?: {
      honmei: string;
      gekkyu: string;
      nichikyu: string;
    };
    seimei_handan?: {
      total: number;
      heaven: number;
      earth: number;
      personality: number;
    };
    seimei_result?: {
      total?: number;
      heaven?: number;
      earth?: number;
      personality?: number;
      original_response?: {
        data?: {
          sei?: string;
          mei?: string;
          fullName?: string;
          characters?: CharacterInfo[];
          kakusu?: {
            tenkaku?: number;
            jinkaku?: number;
            chikaku?: number;
            soukaku?: number;
            gaikaku?: number;
          };
          kanteiResults?: KanteiData[];
          gogyouBalance?: {
            isBalanced?: boolean;
            analysis?: string;
            detailedExplanation?: GogyouExplanation;
          };
          youinPattern?: {
            pattern?: string;
            analysis?: string;
            detailedExplanation?: YouinExplanation;
          };
          overallScore?: number;
          grade?: string;
        };
      };
    };
    kantei_id?: string;
  };
}

const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, calculationResult } = location.state as LocationState || {};

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [kanteiData, setKanteiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(true);
  const [kanteiComment, setKanteiComment] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [commentUpdateSuccess, setCommentUpdateSuccess] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(getDefaultTheme());
  const [selectedFonts, setSelectedFonts] = useState<FontSelection>(getDefaultFontSelection());
  const [selectedFontSizes, setSelectedFontSizes] = useState<FontSizeSelection>(getDefaultFontSizeSelection());
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(loadCompanyInfo());

  // 認証状態をチェック & ユーザーテーマを読み込み（Phase 1.5では無効化）
  useEffect(() => {
    // const token = getAuthToken();
    // if (!token) {
    //   navigate('/login', { replace: true });
    //   return;
    // }

    // ユーザーのテーマ設定を取得
    const loadUserTheme = async () => {
      try {
        const response = await authAPI.getUserTheme();
        if (response.data && response.data.theme_id) {
          const themeId = response.data.theme_id;
          const theme = getDefaultTheme(); // まずデフォルトを取得
          const themesList = colorThemes;
          const userTheme = themesList.find(t => t.id === themeId) || theme;
          setSelectedTheme(userTheme);
        }
      } catch (error) {
        console.log('Failed to load user theme, using default');
      }
    };

    loadUserTheme();
  }, [navigate]);

  // IDがある場合は鑑定データを取得
  useEffect(() => {
    if (id && id !== 'temp' && !formData) {
      fetchKanteiData();
    }
  }, [id]);

  // 既存のコメントを読み込む
  useEffect(() => {
    const loadComment = async () => {
      if (id && id !== 'temp') {
        // const token = getAuthToken();
        // if (!token) return;

        try {
          const response = await fetch(`http://localhost:5004/api/kantei/${id}`, {
            headers: {
              // 'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.kantei_comment) {
              setKanteiComment(data.kantei_comment);
            }
          }
        } catch (error) {
          console.error('コメント読み込みエラー:', error);
        }
      }
    };
    loadComment();
  }, [id]);

  // テーマを初期化時に適用
  useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    applyFonts(selectedFonts);
  }, [selectedFonts]);

  useEffect(() => {
    applyFontSizes(selectedFontSizes);
  }, [selectedFontSizes]);

  useEffect(() => {
    saveCompanyInfo(companyInfo);
  }, [companyInfo]);

  const fetchKanteiData = async () => {
    if (!id || id === 'temp') return;

    setIsLoading(true);
    try {
      const data = await kanteiAPI.getById(id);
      setKanteiData(data);
    } catch (error: any) {
      console.error('鑑定データ取得エラー:', error);
      setErrorMessage('鑑定データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login', { replace: true });
  };

  const handleGoToHistory = () => {
    navigate('/history');
  };

  const handleSendEmail = async () => {
    if (!id || id === 'temp') {
      setErrorMessage('メール送信には鑑定IDが必要です。');
      return;
    }

    const email = (kanteiData?.email || formData?.email);
    if (!email) {
      setErrorMessage('送信先メールアドレスが見つかりません。');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      await kanteiAPI.sendEmail(id, email);
      setSendSuccess(true);
    } catch (error: any) {
      console.error('メール送信エラー:', error);
      if (error.response?.status === 400) {
        setErrorMessage('メール送信データに誤りがあります。');
      } else if (error.response?.status === 500) {
        setErrorMessage('メール送信に失敗しました。しばらく時間をおいて再度お試しください。');
      } else {
        setErrorMessage('メール送信でエラーが発生しました。');
      }
    } finally {
      setIsSending(false);
    }
  };


  const handleBack = () => {
    navigate('/create');
  };

  const handleTogglePrintPreview = () => {
    setIsPrintPreview(!isPrintPreview);
  };

  const handleUpdateComment = async () => {
    if (!id || id === 'temp') {
      setErrorMessage('コメント更新には鑑定IDが必要です。');
      return;
    }

    // Phase 1.5: 認証チェック無効化
    // const token = getAuthToken();
    // if (!token) {
    //   setErrorMessage('認証が必要です。ログインしてください。');
    //   navigate('/login', { replace: true });
    //   return;
    // }

    try {
      setIsUpdatingComment(true);
      setErrorMessage('');

      const response = await fetch(`http://localhost:5004/api/kantei/${id}/comment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: kanteiComment
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('アクセス権限がありません');
        } else if (response.status === 401) {
          throw new Error('認証が無効です');
        } else {
          throw new Error(`コメント更新に失敗しました (${response.status})`);
        }
      }

      // 成功メッセージ（一時的に表示）
      setCommentUpdateSuccess(true);
      setTimeout(() => setCommentUpdateSuccess(false), 3000);

    } catch (error: any) {
      console.error('コメント更新エラー:', error);
      setErrorMessage(error.message || 'コメントの更新に失敗しました。');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleThemeChange = async (theme: ColorTheme) => {
    setSelectedTheme(theme);
    applyTheme(theme);

    // ユーザーのテーマ設定を保存
    try {
      await authAPI.updateUserTheme({ theme_id: theme.id });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // 表示用データを決定
  const displayData = kanteiData || formData;
  const displayResult = kanteiData || calculationResult;


  // 印刷プレビューモードの場合
  if (isPrintPreview) {
    return (
      <PrintPreviewMode
        id={id || 'temp'}
        displayData={displayData}
        displayResult={displayResult}
        onClose={handleTogglePrintPreview}
        kanteiComment={kanteiComment}
        selectedTheme={selectedTheme}
        companyInfo={companyInfo}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="preview-page">
        <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
      </div>
    );
  }

  if (!displayData || !displayResult) {
    return (
      <div className="preview-page">
        <Container>
          <Alert severity="warning" style={{ marginTop: '32px' }}>
            鑑定データが見つかりません。<br />
            鑑定書作成ページから開始してください。
          </Alert>
          <Button onClick={handleBack} style={{ marginTop: '16px' }}>
            鑑定書作成に戻る
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="preview-page" data-testid="print-preview-container">
      {/* ヘッダー */}
      <AppBar position="static" className="header">
        <Toolbar>
          <Button
            style={{ color: 'inherit', marginRight: '16px' }}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            戻る
          </Button>
          <Typography variant="h6" component="h1" className="header-title" style={{ flexGrow: 1 }}>
            鑑定書プレビュー
          </Typography>
          <Button
            style={{ color: 'inherit', marginRight: '8px' }}
            onClick={handleGoToHistory}
            startIcon={<HistoryIcon />}
          >
            履歴
          </Button>
          <Button
            style={{ color: 'inherit' }}
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} className="main-container" sx={{ maxWidth: '95%' }}>
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
              鑑定書 #{id}
            </Typography>
            <Box sx={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #34495e 50%, transparent 100%)',
              ml: 3
            }} />
          </Box>
          <Typography variant="subtitle1" className="page-description" sx={{ mt: 3 }}>
            内容をご確認の上、印刷用表示を行ってください
          </Typography>
        </Box>

        {sendSuccess && (
          <Alert severity="success" style={{ marginBottom: '24px' }}>
            鑑定書をメールで送信しました！
          </Alert>
        )}

        {commentUpdateSuccess && (
          <Alert severity="success" style={{ marginBottom: '24px' }}>
            コメントを更新しました！
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" style={{ marginBottom: '24px' }}>
            {errorMessage}
          </Alert>
        )}

        <div className="content-layout">
          {/* 鑑定書プレビュー */}
          <Card className="preview-card">
            <CardContent className="certificate-content">
              {/* 事業所・鑑定士情報 */}
              {(companyInfo.companyName || companyInfo.appraiserName) && (
                <div className="certificate-company-info">
                  <div className="certificate-company-name">
                    {companyInfo.companyName || ''}
                  </div>
                  <div className="certificate-appraiser-name">
                    {companyInfo.appraiserName && `鑑定士: ${companyInfo.appraiserName}`}
                  </div>
                </div>
              )}

              <h1 className="certificate-main-title">
                総合鑑定書
              </h1>
              <div className="certificate-subtitle">
                九星気学・姓名判断による詳細鑑定
              </div>

              <hr className="certificate-divider" />

              {/* クライアント情報 */}
              <div className="certificate-section">
                <h2 className="certificate-section-title">
                  ご依頼者情報
                </h2>
                <div className="certificate-info-grid">
                  <div className="certificate-info-field" data-testid="client-name">
                    <span className="certificate-info-label">氏名:</span>
                    <span>
                      {displayData.name ||
                       (displayData.client_info?.surname && displayData.client_info?.given_name
                         ? `${displayData.client_info.surname} ${displayData.client_info.given_name}`
                         : displayData.surname && displayData.givenName
                           ? `${displayData.surname} ${displayData.givenName}`
                           : displayData.surname && displayData.given_name
                             ? `${displayData.surname} ${displayData.given_name}`
                             : 'データなし')}
                    </span>
                  </div>
                  <div className="certificate-info-field" data-testid="client-birthdate">
                    <span className="certificate-info-label">生年月日:</span>
                    <span>
                      {displayData.birth_date ||
                       displayData.birthDate ||
                       displayData.client_info?.birth_date ||
                       'データなし'}
                    </span>
                  </div>
                  <div className="certificate-info-field" data-testid="client-gender">
                    <span className="certificate-info-label">性別:</span>
                    <span>
                      {displayData.gender === 'male' ? '男性' :
                       displayData.gender === 'female' ? '女性' :
                       displayData.gender || 'データなし'}
                    </span>
                  </div>
                  <div className="certificate-info-field" data-testid="client-birthtime">
                    <span className="certificate-info-label">出生時間:</span>
                    <span>{displayData.birth_time || displayData.birthTime || '指定なし'}</span>
                  </div>
                  {(displayData.birth_place || displayData.birthPlace) && (
                    <div className="certificate-info-field" style={{ gridColumn: '1 / -1' }}>
                      <span className="certificate-info-label">出生地:</span>
                      <span>{displayData.birth_place || displayData.birthPlace}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 九星気学結果 */}
              <Box className="result-section" data-testid="kyusei-results">
                <h2 className="certificate-section-title">
                  九星気学鑑定結果
                </h2>
                <div className="certificate-result-grid">
                  <div className="certificate-result-item">
                    <div className="result-label">本命星</div>
                    <div className="result-value">
                      {displayResult?.kyusei_result?.birth?.year?.name || displayResult?.kyusei_kigaku?.honmei || '未計算'}
                    </div>
                  </div>
                  <div className="certificate-result-item">
                    <div className="result-label">月命星</div>
                    <div className="result-value">
                      {displayResult?.kyusei_result?.birth?.month?.name || displayResult?.kyusei_kigaku?.gekkyu || '未計算'}
                    </div>
                  </div>
                  <div className="certificate-result-item">
                    <div className="result-label">日命星</div>
                    <div className="result-value">
                      {displayResult?.kyusei_result?.birth?.day?.name || displayResult?.kyusei_kigaku?.nichimei || '未計算'}
                    </div>
                  </div>
                </div>
              </Box>

              {/* 九星気学方位盤 */}
              <KyuseiHoiban
                birthDate={displayData.birth_date || displayData.birthDate}
                targetDate={new Date().toISOString().split('T')[0]}
                formData={{
                  name: displayData.name || (displayData.client_info?.surname && displayData.client_info?.given_name ? `${displayData.client_info.surname} ${displayData.client_info.given_name}` : ''),
                  birthDate: displayData.birth_date || displayData.birthDate,
                  birthTime: displayData.birth_time || displayData.birthTime,
                  gender: displayData.gender
                }}
              />

              <hr className="certificate-divider" />

              {/* 姓名判断結果 */}
              <Box className="result-section" data-testid="seimei-results">
                <h2 className="certificate-section-title">
                  姓名判断結果
                </h2>
                <div className="certificate-result-grid">
                  <div className="certificate-result-item">
                    <div className="result-label">天格</div>
                    <div className="result-value">
                      {displayResult?.seimei_result?.heaven || displayResult?.seimei_handan?.heaven || '未計算'}画
                    </div>
                  </div>
                  <div className="certificate-result-item">
                    <div className="result-label">人格</div>
                    <div className="result-value">
                      {displayResult?.seimei_result?.personality || displayResult?.seimei_handan?.personality || '未計算'}画
                    </div>
                  </div>
                  <div className="certificate-result-item">
                    <div className="result-label">地格</div>
                    <div className="result-value">
                      {displayResult?.seimei_result?.earth || displayResult?.seimei_handan?.earth || '未計算'}画
                    </div>
                  </div>
                  <div className="certificate-result-item">
                    <div className="result-label">総画</div>
                    <div className="result-value">
                      {displayResult?.seimei_result?.total || displayResult?.seimei_handan?.total || '未計算'}画
                    </div>
                  </div>
                </div>

                {/* 詳細解説アコーディオン */}
                {displayResult?.seimei_result?.original_response?.data && (
                  <Box style={{ marginTop: '16px' }}>
                    {/* 文字詳細解説 */}
                    {displayResult.seimei_result.original_response.data.characters &&
                     displayResult.seimei_result.original_response.data.characters.some((char: any) => char.detailedExplanation?.kakusu) && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <InfoIcon style={{ color: '#0288d1' }} />
                            <Typography variant="subtitle2">文字別詳細解説</Typography>
                            <Chip
                              label={`${displayResult.seimei_result.original_response.data.characters.length}文字`}
                              size="small"
                              style={{ color: '#0288d1' }}
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {displayResult.seimei_result.original_response.data.characters.map((char: any, index: number) => (
                              <Card variant="outlined" style={{ padding: '16px' }} key={index}>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                    {char.character}
                                  </Typography>
                                  <Box style={{ display: 'flex', gap: '4px' }}>
                                    <Chip label={`${char.strokeCount}画`} size="small" style={{ color: '#1976d2' }} />
                                    <Chip label={char.gogyou} size="small" style={{ color: '#dc004e' }} />
                                    <Chip label={char.youin} size="small" style={{ color: '#424242' }} />
                                  </Box>
                                </Box>
                                {char.detailedExplanation?.kakusu && (
                                  <Box>
                                    <Box style={{ marginBottom: '4px' }}>
                                      <Typography variant="body2" style={{ color: '#757575' }} component="span">
                                        {char.detailedExplanation.kakusu.meaning} -
                                      </Typography>
                                      <Chip
                                        label={char.detailedExplanation.kakusu.type}
                                        size="small"
                                        style={{ marginLeft: '4px' }}
                                        color={char.detailedExplanation.kakusu.type.includes('吉') ? 'success' :
                                               char.detailedExplanation.kakusu.type === '平' ? 'default' : 'error'}
                                      />
                                    </Box>
                                    <Typography variant="body2">
                                      {char.detailedExplanation.kakusu.description}
                                    </Typography>
                                  </Box>
                                )}
                              </Card>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* 陰陽配列の詳細解説 */}
                    {displayResult.seimei_result.original_response.data.youinPattern?.detailedExplanation && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <InfoIcon style={{ color: '#1976d2' }} />
                            <Typography variant="subtitle2">陰陽配列解説</Typography>
                            <Chip
                              label={displayResult.seimei_result.original_response.data.youinPattern.detailedExplanation.name}
                              size="small"
                              style={{ color: '#1976d2' }}
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" style={{ color: '#757575', marginBottom: '8px' }}>
                            パターン: {displayResult.seimei_result.original_response.data.youinPattern.pattern}
                          </Typography>
                          <Typography variant="body1">
                            {displayResult.seimei_result.original_response.data.youinPattern.detailedExplanation.description}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* 五行バランスの詳細解説 */}
                    {displayResult.seimei_result.original_response.data.gogyouBalance?.detailedExplanation && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <InfoIcon style={{ color: '#dc004e' }} />
                            <Typography variant="subtitle2">五行バランス解説</Typography>
                            <Chip
                              label={displayResult.seimei_result.original_response.data.gogyouBalance.detailedExplanation.combination}
                              size="small"
                              style={{ color: '#dc004e' }}
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body1">
                            {displayResult.seimei_result.original_response.data.gogyouBalance.detailedExplanation.description}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* 各格の詳細解説 */}
                    {displayResult.seimei_result.original_response.data.kanteiResults &&
                     displayResult.seimei_result.original_response.data.kanteiResults.length > 0 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <InfoIcon style={{ color: '#2e7d32' }} />
                            <Typography variant="subtitle2">各格詳細解説</Typography>
                            <Chip
                              label={`総合スコア: ${displayResult.seimei_result.original_response.data.overallScore || 0}点`}
                              size="small"
                              style={{ color: '#2e7d32' }}
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {displayResult.seimei_result.original_response.data.kanteiResults
                              .filter((kantei: KanteiData) => kantei.category !== 'gogyou_balance' && kantei.category !== 'youin_pattern')
                              .map((kantei: KanteiData, index: number) => {
                              const kakusuValue = (() => {
                                switch(kantei.category) {
                                  case 'tenkaku': return displayResult.seimei_result?.original_response?.data?.kakusu?.tenkaku;
                                  case 'jinkaku': return displayResult.seimei_result?.original_response?.data?.kakusu?.jinkaku;
                                  case 'chikaku': return displayResult.seimei_result?.original_response?.data?.kakusu?.chikaku;
                                  case 'soukaku': return displayResult.seimei_result?.original_response?.data?.kakusu?.soukaku;
                                  case 'gaikaku': return displayResult.seimei_result?.original_response?.data?.kakusu?.gaikaku;
                                  default: return null;
                                }
                              })();

                              return (
                                <Card variant="outlined" style={{ padding: '16px' }} key={index}>
                                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <Typography variant="subtitle2">
                                      {kantei.category === 'tenkaku' ? '天格' :
                                       kantei.category === 'jinkaku' ? '人格' :
                                       kantei.category === 'chikaku' ? '地格' :
                                       kantei.category === 'soukaku' ? '総格' :
                                       kantei.category === 'gaikaku' ? '外格' :
                                       kantei.category === 'gogyou_balance' ? '五行バランス' :
                                       kantei.category === 'youin_pattern' ? '陰陽配列' : kantei.category}
                                    </Typography>
                                    {kakusuValue && (
                                      <Chip
                                        label={`${kakusuValue}画`}
                                        size="small"
                                        color={kantei.score >= 90 ? 'success' :
                                               kantei.score >= 70 ? 'primary' :
                                               kantei.score >= 50 ? 'warning' : 'error'}
                                      />
                                    )}
                                  </Box>
                                  {kantei.detailedExplanation?.kakusu && (
                                    <>
                                      <Box style={{ marginBottom: '4px' }}>
                                        <Typography variant="body2" style={{ color: '#757575' }} component="span">
                                          {kantei.detailedExplanation.kakusu.meaning} -
                                        </Typography>
                                        <Chip
                                          label={kantei.detailedExplanation.kakusu.type}
                                          size="small"
                                          style={{ marginLeft: '4px' }}
                                          color={kantei.detailedExplanation.kakusu.type.includes('吉') ? 'success' :
                                                 kantei.detailedExplanation.kakusu.type === '平' ? 'default' : 'error'}
                                        />
                                      </Box>
                                      <Typography variant="body2">
                                        {kantei.detailedExplanation.kakusu.description}
                                      </Typography>
                                    </>
                                  )}
                                </Card>
                              );
                            })}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Box>
                )}
              </Box>

              {/* 鑑定士コメント（プレビュー表示用） */}
              {kanteiComment && (
                <>
                  <hr className="certificate-divider" />
                  <div className="certificate-section" style={{ marginTop: '24px' }}>
                    <Typography variant="h6" gutterBottom className="certificate-section-title">
                      鑑定士からのコメント
                    </Typography>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}>
                    {kanteiComment}
                  </div>
                  </div>
                </>
              )}

              <Box className="certificate-footer">
                <Typography variant="body2" style={{ color: '#757575' }}>
                  発行日: {new Date().toLocaleDateString('ja-JP')}
                </Typography>
                <Typography variant="body2" style={{ color: '#757575' }}>
                  運命織 - プロフェッショナル鑑定書作成システム
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* デザイン設定パネル */}
          <Card className="action-panel">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: '#1976d2' }}>
                <SettingsIcon /> デザイン設定
              </Typography>

              {/* デザイン設定 - 折りたたみ式 */}
              <Accordion sx={{ mb: 1, boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0, '&.MuiTypography-root': { marginBottom: '0px !important' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon sx={{ fontSize: 18 }} /> カラーテーマ
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <ThemeSelector
                    selectedTheme={selectedTheme}
                    onThemeChange={handleThemeChange}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ mb: 1, boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0, '&.MuiTypography-root': { marginBottom: '0px !important' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FontIcon sx={{ fontSize: 18 }} /> フォント選択
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <FontSelector
                    fontSelection={selectedFonts}
                    onFontChange={setSelectedFonts}
                    fontSizeSelection={selectedFontSizes}
                    onFontSizeChange={setSelectedFontSizes}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ mb: 1, boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0, '&.MuiTypography-root': { marginBottom: '0px !important' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CommentIcon sx={{ fontSize: 18 }} /> 鑑定士コメント
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    multiline
                    rows={4}
                    fullWidth
                    value={kanteiComment}
                    onChange={(e) => setKanteiComment(e.target.value)}
                    placeholder="鑑定に関するコメントを入力してください（200文字以内）"
                    inputProps={{ maxLength: 200 }}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>
                      {kanteiComment.length}/200文字
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleUpdateComment}
                      disabled={isUpdatingComment}
                      sx={{ backgroundColor: '#4caf50' }}
                    >
                      {isUpdatingComment ? '更新中...' : '反映'}
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ mb: 1, boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0, '&.MuiTypography-root': { marginBottom: '0px !important' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon sx={{ fontSize: 18 }} /> 事業所・鑑定士情報
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <CompanyInfoSettings
                    companyInfo={companyInfo}
                    onCompanyInfoChange={setCompanyInfo}
                  />
                </AccordionDetails>
              </Accordion>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button
                variant="contained"
                fullWidth
                startIcon={<PrintIcon />}
                onClick={handleTogglePrintPreview}
                style={{ marginBottom: '16px', backgroundColor: '#2196f3' }}
                data-testid="pdf-generate-button"
              >
                印刷用表示
              </Button>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default PreviewPage;