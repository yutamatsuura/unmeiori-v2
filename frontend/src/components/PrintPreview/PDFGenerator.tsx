import React from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

interface PDFGeneratorProps {
  kanteiId: string;
  isGenerating: boolean;
  onGenerate: () => void;
  success: boolean;
  error: string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  kanteiId,
  isGenerating,
  onGenerate,
  success,
  error
}) => {
  // ブラウザの印刷機能を使用してPDF生成の代替案を提示
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <>
      {/* API経由のPDF生成ボタン */}
      <Button
        variant="contained"
        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
        onClick={onGenerate}
        disabled={isGenerating}
        sx={{ bgcolor: '#4caf50', mr: 1 }}
        data-testid="pdf-generate-button"
      >
        {isGenerating ? 'PDF生成中...' : 'PDF生成'}
      </Button>

      {/* ブラウザ印刷機能のボタン */}
      <Button
        variant="outlined"
        startIcon={<PdfIcon />}
        onClick={handleBrowserPrint}
        sx={{ color: '#4caf50', borderColor: '#4caf50' }}
        data-testid="browser-print-button"
      >
        ブラウザ印刷
      </Button>

      {/* 成功・エラーメッセージ */}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} data-testid="pdf-success">
          PDF生成が完了しました！ダウンロードが開始されます。
        </Alert>
      )}
      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <div>
            <div>{error}</div>
            <div style={{ marginTop: 8, fontSize: '0.9em' }}>
              <strong>推奨：</strong>「ブラウザ印刷」ボタンをクリックして、
              印刷ダイアログで「PDFとして保存」を選択してください。
              この方法で印刷プレビューと完全に同一のPDFが生成されます。
            </div>
          </div>
        </Alert>
      )}
    </>
  );
};

export default PDFGenerator;