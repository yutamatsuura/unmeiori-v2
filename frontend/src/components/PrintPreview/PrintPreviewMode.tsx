import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Description as WordIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import KyuseiHoiban from '../KyuseiHoiban';
import EditableField from './EditableField';
import { kanteiAPI } from '../../services/api';
import { applyTheme, loadCompanyInfo } from '../../utils/themes';
import type { ColorTheme } from '../../utils/themes';
import type { CompanyInfo } from '../../utils/themes';
import '../../styles/certificate-shared.css';
import './PrintPreview.css';

const PrintContainer = styled(Paper)(({ theme }) => ({
  width: '210mm',
  minHeight: '297mm',
  margin: '0 auto',
  padding: '5mm 20mm 20mm 20mm',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  '@media screen': {
    marginBottom: 0,
    transform: 'scale(0.8)',
    transformOrigin: 'top center',
  },
  '@media print': {
    width: '100%',
    height: 'auto',
    margin: 0,
    padding: '5mm 15mm 15mm 15mm',
    boxShadow: 'none',
    transform: 'none',
    pageBreakAfter: 'auto',
  }
}));

const PrintHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: 0,
  marginBottom: theme.spacing(4),
  borderBottom: '1px solid var(--certificate-primary)',
  paddingBottom: theme.spacing(2),
  '@media print': {
    marginTop: 0,
    marginBottom: '15mm',
    paddingBottom: '5mm',
  }
}));

const ClientInfoGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiGrid-item': {
    padding: theme.spacing(1),
  },
  '@media print': {
    marginBottom: '10mm',
  }
}));

const ResultSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .result-grid': {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  '@media print': {
    marginBottom: '8mm',
    '& .result-grid': {
      gap: '4mm',
      marginBottom: '4mm',
    }
  }
}));

const HoibanSection = styled(Box)(({ theme }) => ({
  margin: '0 !important',
  padding: 0,
  backgroundColor: 'transparent',
  width: '100% !important',
  maxWidth: '100% !important',
  pageBreakInside: 'avoid',
  '& .MuiCard-root': {
    margin: '0 !important',
    marginBottom: '0 !important',
    marginTop: '0 !important',
    width: '100% !important',
    maxWidth: '100% !important',
    boxShadow: theme.shadows[1],
  },
  '& .MuiCardContent-root': {
    margin: '0 !important',
    padding: `${theme.spacing(2)} !important`,
    width: '100% !important',
    maxWidth: '100% !important',
    '&:last-child': {
      paddingBottom: `${theme.spacing(2)} !important`,
    },
  },
  '& .MuiBox-root': {
    width: '100% !important',
    maxWidth: '100% !important',
    margin: '0 !important',
    minHeight: 'auto !important',
    height: 'auto !important',
    maxHeight: 'none !important',
    overflow: 'visible !important',
  },
  '& .kyusei-hoiban': {
    width: '100% !important',
    margin: '0 !important',
    transform: 'scale(0.85)',
    transformOrigin: 'center top',
  },
  '@media print': {
    margin: '2mm 0 !important',
    pageBreakInside: 'avoid',
    '& .MuiCard-root': {
      boxShadow: 'none',
      border: '1px solid #ddd',
    },
    '& .MuiCardContent-root': {
      padding: '2mm !important',
    },
    '& .kyusei-hoiban': {
      transform: 'scale(0.65)',
      transformOrigin: 'center top',
      height: 'auto !important',
      maxHeight: 'none !important',
      overflow: 'visible !important',
      marginBottom: '2mm !important',
    }
  }
}));

const PrintFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(4),
  borderTop: '1px solid #e0e0e0',
  textAlign: 'center',
  '@media print': {
    position: 'absolute',
    bottom: '15mm',
    left: '15mm',
    right: '15mm',
    paddingTop: '5mm',
  }
}));

const ControlPanel = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 20,
  right: 20,
  zIndex: 1000,
  display: 'flex',
  gap: theme.spacing(1),
  '@media print': {
    display: 'none',
  }
}));

// 型定義
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

interface PrintPreviewModeProps {
  id: string;
  displayData: any;
  displayResult: any;
  onClose: () => void;
  kanteiComment?: string;
  selectedTheme?: ColorTheme;
  companyInfo?: CompanyInfo;
}

const PrintPreviewMode: React.FC<PrintPreviewModeProps> = ({
  id,
  displayData,
  displayResult,
  onClose,
  kanteiComment = '',
  selectedTheme,
  companyInfo
}) => {
  const currentCompanyInfo = companyInfo || loadCompanyInfo();
  const [editableData, setEditableData] = useState({
    name: displayData.name ||
          (displayData.client_info?.surname && displayData.client_info?.given_name
            ? `${displayData.client_info.surname} ${displayData.client_info.given_name}`
            : displayData.surname && displayData.givenName
              ? `${displayData.surname} ${displayData.givenName}`
              : displayData.surname && displayData.given_name
                ? `${displayData.surname} ${displayData.given_name}`
                : ''),
    birthDate: displayData.birth_date || displayData.birthDate || '',
    gender: displayData.gender || '',
    birthTime: displayData.birth_time || displayData.birthTime || '',
    birthPlace: displayData.birth_place || displayData.birthPlace || ''
  });

  // コメント機能はメインプレビュー画面に移動

  // テーマを印刷プレビュー時にも適用
  useEffect(() => {
    if (selectedTheme) {
      applyTheme(selectedTheme);
    }
  }, [selectedTheme]);

  // コメント読み込み機能はメインプレビュー画面に移動

  const handleFieldChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handlePrint = () => {
    window.print();
  };

  // コメント更新機能はメインプレビュー画面に移動

  const handleWordExport = async () => {
    try {
      // 鑑定データの準備
      const exportData = {
        formData: editableData,
        kyuseiResult: displayResult.kyusei,
        seimeiResult: displayResult.seimei,
        birthData: displayResult.birthData,
        houiDetails: displayResult.houiDetails,
        kyuseiHoiban: displayResult.kyuseiHoiban,
        kanteiComment: kanteiComment,
        targetDate: new Date().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).replace(/\s/g, '')
      };

      // FastAPI エンドポイントにPOST
      const response = await fetch(`http://localhost:5004/api/generate-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      });

      if (!response.ok) {
        throw new Error(`Word文書生成エラー: ${response.status}`);
      }

      // ファイルダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // ファイル名生成
      const clientName = editableData.name || 'unknown';
      const currentDate = new Date().toISOString().split('T')[0];
      a.download = `鑑定書_${clientName}_${currentDate}.docx`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Word出力エラー:', error);
      alert('Word文書の生成に失敗しました。');
    }
  };

  const formatGender = (gender: string) => {
    return gender === 'male' ? '男性' : gender === 'female' ? '女性' : gender;
  };

  const getResultValue = (path: string[]) => {
    let current = displayResult;
    for (const key of path) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return '未計算';
      }
    }
    return current || '未計算';
  };

  return (
    <>
      <ControlPanel>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={handlePrint}
          sx={{ bgcolor: '#2196f3' }}
        >
          PDF印刷
        </Button>
        <Button
          variant="contained"
          startIcon={<WordIcon />}
          onClick={handleWordExport}
          sx={{ bgcolor: '#1976d2' }}
        >
          Word出力
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
        >
          閉じる
        </Button>
      </ControlPanel>


      <div className="print-preview-container">
        <PrintContainer className="print-container">
          {/* ヘッダー */}
          <div className="print-header">
            {/* 事業所・鑑定士情報 */}
            {(currentCompanyInfo.companyName || currentCompanyInfo.appraiserName) && (
              <div className="certificate-company-info">
                <div className="certificate-company-name">
                  {currentCompanyInfo.companyName || ''}
                </div>
                <div className="certificate-appraiser-name">
                  {currentCompanyInfo.appraiserName && `鑑定士: ${currentCompanyInfo.appraiserName}`}
                </div>
              </div>
            )}

            <h1 className="certificate-main-title">
              総合鑑定書
            </h1>
            <div className="certificate-subtitle">
              九星気学・姓名判断による詳細鑑定
            </div>
          </div>

          {/* クライアント情報 */}
          <div className="certificate-section" style={{ marginTop: '4px' }}>
            <h2 className="certificate-section-title">
              ご依頼者情報
            </h2>
            <div className="certificate-info-grid">
              <div className="certificate-info-field">
                <span className="certificate-info-label">氏名:</span>
                <EditableField
                  value={editableData.name}
                  onChange={(value) => handleFieldChange('name', value)}
                  variant="body1"
                />
              </div>
              <div className="certificate-info-field">
                <span className="certificate-info-label">生年月日:</span>
                <EditableField
                  value={editableData.birthDate}
                  onChange={(value) => handleFieldChange('birthDate', value)}
                  variant="body1"
                />
              </div>
              <div className="certificate-info-field">
                <span className="certificate-info-label">性別:</span>
                <EditableField
                  value={formatGender(editableData.gender)}
                  onChange={(value) => handleFieldChange('gender', value)}
                  variant="body1"
                />
              </div>
              <div className="certificate-info-field">
                <span className="certificate-info-label">出生時間:</span>
                <EditableField
                  value={editableData.birthTime || '指定なし'}
                  onChange={(value) => handleFieldChange('birthTime', value)}
                  variant="body1"
                />
              </div>
              {editableData.birthPlace && (
                <div className="certificate-info-field" style={{ gridColumn: '1 / -1' }}>
                  <span className="certificate-info-label">出生地:</span>
                  <EditableField
                    value={editableData.birthPlace}
                    onChange={(value) => handleFieldChange('birthPlace', value)}
                    variant="body1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 九星気学結果 */}
          <div className="certificate-section">
            <h2 className="certificate-section-title">
              九星気学鑑定結果
            </h2>
            <div className="certificate-result-grid">
              <div className="certificate-result-item">
                <div className="result-label">本命星</div>
                <div className="result-value">
                  {getResultValue(['kyusei_result', 'birth', 'year', 'name']) ||
                   getResultValue(['kyusei_kigaku', 'honmei'])}
                </div>
              </div>
              <div className="certificate-result-item">
                <div className="result-label">月命星</div>
                <div className="result-value">
                  {getResultValue(['kyusei_result', 'birth', 'month', 'name']) ||
                   getResultValue(['kyusei_kigaku', 'gekkyu'])}
                </div>
              </div>
              <div className="certificate-result-item">
                <div className="result-label">日命星</div>
                <div className="result-value">
                  {getResultValue(['kyusei_result', 'birth', 'day', 'name']) ||
                   getResultValue(['kyusei_kigaku', 'nichimei'])}
                </div>
              </div>
            </div>
          </div>

          {/* 九星気学方位盤 */}
          <div className="certificate-hoiban-section" style={{ marginTop: '4px' }}>
            <KyuseiHoiban
              birthDate={editableData.birthDate}
              targetDate={new Date().toISOString().split('T')[0]}
              formData={{
                name: editableData.name,
                birthDate: editableData.birthDate,
                birthTime: editableData.birthTime,
                gender: editableData.gender
              }}
            />
          </div>

          <hr className="certificate-divider" />

          {/* 姓名判断結果 */}
          <div className="certificate-section">
            <h2 className="certificate-section-title">
              姓名判断結果
            </h2>
            <div className="certificate-result-grid">
              <div className="certificate-result-item">
                <div className="result-label">天格</div>
                <div className="result-value">
                  {getResultValue(['seimei_result', 'heaven']) ||
                   getResultValue(['seimei_handan', 'heaven'])}画
                </div>
              </div>
              <div className="certificate-result-item">
                <div className="result-label">人格</div>
                <div className="result-value">
                  {getResultValue(['seimei_result', 'personality']) ||
                   getResultValue(['seimei_handan', 'personality'])}画
                </div>
              </div>
              <div className="certificate-result-item">
                <div className="result-label">地格</div>
                <div className="result-value">
                  {getResultValue(['seimei_result', 'earth']) ||
                   getResultValue(['seimei_handan', 'earth'])}画
                </div>
              </div>
              <div className="certificate-result-item">
                <div className="result-label">総画</div>
                <div className="result-value">
                  {getResultValue(['seimei_result', 'total']) ||
                   getResultValue(['seimei_handan', 'total'])}画
                </div>
              </div>
            </div>
          </div>

          {/* 詳細解説（印刷用・簡略版） */}
          {displayResult?.seimei_result?.original_response?.data && (
            <div style={{ marginTop: '16px' }}>
              {/* 文字別詳細解説 */}
              {displayResult.seimei_result.original_response.data.characters &&
               displayResult.seimei_result.original_response.data.characters.some((char: any) => char.detailedExplanation?.kakusu) && (
                <div className="certificate-detail-section">
                  <div className="certificate-detail-header">
                    <InfoIcon color="info" />
                    <span className="certificate-detail-title">文字別詳細解説</span>
                    <span className="certificate-detail-badge">
                      {displayResult.seimei_result.original_response.data.characters.length}文字
                    </span>
                  </div>
                  <div className="certificate-detail-content">
                    {displayResult.seimei_result.original_response.data.characters.map((char: any, index: number) => (
                      <div className="certificate-detail-card" key={index}>
                        <div className="certificate-detail-card-header">
                          <span className="certificate-detail-card-title">
                            {char.character}
                          </span>
                          <div className="certificate-detail-badges">
                            <span className="certificate-detail-badge">
                              {char.strokeCount}画
                            </span>
                            <span className="certificate-detail-badge secondary">
                              {char.gogyou}
                            </span>
                            <span className="certificate-detail-badge" style={{backgroundColor: '#f5f5f5', color: '#666'}}>
                              {char.youin}
                            </span>
                          </div>
                        </div>
                        {char.detailedExplanation?.kakusu && (
                          <div>
                            <div style={{ marginBottom: '4px' }}>
                              <span className="certificate-color-gray" style={{ fontSize: '0.875rem' }}>
                                {char.detailedExplanation.kakusu.meaning} -
                              </span>
                              <span style={{
                                marginLeft: '4px',
                                fontWeight: 'bold',
                                color: char.detailedExplanation.kakusu.type.includes('吉') ? 'var(--certificate-success)' :
                                       char.detailedExplanation.kakusu.type === '平' ? 'var(--certificate-text-gray)' : 'var(--certificate-secondary)'
                              }}>
                                {char.detailedExplanation.kakusu.type}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                              {char.detailedExplanation.kakusu.description}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 陰陽配列の詳細解説 */}
              {displayResult.seimei_result.original_response.data.youinPattern?.detailedExplanation && (
                <div className="certificate-detail-section">
                  <div className="certificate-detail-header">
                    <InfoIcon color="primary" />
                    <span className="certificate-detail-title">陰陽配列解説</span>
                    <span className="certificate-detail-badge">
                      {displayResult.seimei_result.original_response.data.youinPattern.detailedExplanation.name}
                    </span>
                  </div>
                  <div className="certificate-detail-content">
                    <div className="certificate-color-gray" style={{ marginBottom: '8px' }}>
                      パターン: {displayResult.seimei_result.original_response.data.youinPattern.pattern}
                    </div>
                    <div>
                      {displayResult.seimei_result.original_response.data.youinPattern.detailedExplanation.description}
                    </div>
                  </div>
                </div>
              )}

              {/* 五行バランスの詳細解説 */}
              {displayResult.seimei_result.original_response.data.gogyouBalance?.detailedExplanation && (
                <div className="certificate-detail-section">
                  <div className="certificate-detail-header">
                    <InfoIcon color="secondary" />
                    <span className="certificate-detail-title">五行バランス解説</span>
                    <span className="certificate-detail-badge secondary">
                      {displayResult.seimei_result.original_response.data.gogyouBalance.detailedExplanation.combination}
                    </span>
                  </div>
                  <div className="certificate-detail-content">
                    <div>
                      {displayResult.seimei_result.original_response.data.gogyouBalance.detailedExplanation.description}
                    </div>
                  </div>
                </div>
              )}

              {/* 各格の詳細解説 */}
              {displayResult.seimei_result.original_response.data.kanteiResults &&
               displayResult.seimei_result.original_response.data.kanteiResults.length > 0 && (
                <div className="certificate-detail-section">
                  <div className="certificate-detail-header">
                    <InfoIcon color="success" />
                    <span className="certificate-detail-title">各格詳細解説</span>
                  </div>
                  <div className="certificate-detail-content">
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
                        <div className="certificate-detail-card" key={index}>
                          <div className="certificate-detail-card-header">
                            <span className="certificate-detail-card-title">
                              {kantei.category === 'tenkaku' ? '天格' :
                               kantei.category === 'jinkaku' ? '人格' :
                               kantei.category === 'chikaku' ? '地格' :
                               kantei.category === 'soukaku' ? '総格' :
                               kantei.category === 'gaikaku' ? '外格' :
                               kantei.category === 'gogyou_balance' ? '五行バランス' :
                               kantei.category === 'youin_pattern' ? '陰陽配列' : kantei.category}
                            </span>
                            {kakusuValue && (
                              <div className="certificate-detail-badges">
                                <span className="certificate-detail-badge" style={{
                                  backgroundColor: kantei.score >= 90 ? '#e8f5e8' :
                                                  kantei.score >= 70 ? '#e3f2fd' :
                                                  kantei.score >= 50 ? '#fff3e0' : '#ffebee',
                                  color: kantei.score >= 90 ? '#2e7d32' :
                                         kantei.score >= 70 ? '#1976d2' :
                                         kantei.score >= 50 ? '#f57c00' : '#d32f2f'
                                }}>
                                  {kakusuValue}画
                                </span>
                              </div>
                            )}
                          </div>
                          {kantei.detailedExplanation?.kakusu && (
                            <div>
                              <div style={{ marginBottom: '4px' }}>
                                <span className="certificate-color-gray" style={{ fontSize: '0.875rem' }}>
                                  {kantei.detailedExplanation.kakusu.meaning} -
                                </span>
                                <span style={{
                                  marginLeft: '4px',
                                  fontWeight: 'bold',
                                  color: kantei.detailedExplanation.kakusu.type.includes('吉') ? 'var(--certificate-success)' :
                                         kantei.detailedExplanation.kakusu.type === '平' ? 'var(--certificate-text-gray)' : 'var(--certificate-secondary)'
                                }}>
                                  {kantei.detailedExplanation.kakusu.type}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {kantei.detailedExplanation.kakusu.description}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 鑑定士コメント（プレビュー表示用） */}
          {kanteiComment && (
            <>
              <Divider className="certificate-divider" />
              <div className="certificate-section" style={{ marginTop: 'var(--certificate-spacing-lg)' }}>
                <h2 className="certificate-section-title">
                  鑑定士からのコメント
                </h2>
              <div style={{
                padding: 'var(--certificate-spacing-md)',
                backgroundColor: '#f8f9fa',
                border: '1px solid var(--certificate-border)',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {kanteiComment}
              </div>
              </div>
            </>
          )}

          {/* フッター */}
          <div className="certificate-section" style={{ textAlign: 'center', marginTop: 'var(--certificate-spacing-xl)', paddingTop: 'var(--certificate-spacing-md)', borderTop: '1px solid var(--certificate-border)' }}>
            <div className="certificate-color-gray" style={{ marginBottom: 'var(--certificate-spacing-xs)' }}>
              発行日: {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="certificate-color-gray">
              運命織 - プロフェッショナル鑑定書作成システム
            </div>
          </div>
        </PrintContainer>

        {/* コメント入力セクション（印刷時は非表示） */}
        {/* コメント入力UIはメインプレビュー画面に移動 */}
      </div>
    </>
  );
};

export default PrintPreviewMode;