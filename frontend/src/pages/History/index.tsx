import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Description as WordIcon,
  ArrowBack as BackIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { kanteiAPI, authAPI, getAuthToken } from '../../services/api';
import './styles.css';

interface HistoryItem {
  id: string;
  client_name: string;
  client_birth_date: string;
  created_at: string;
  pdf_generated?: boolean;
}

interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  filtered_total?: number;
  filtered_pages?: number;
}

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);



  const itemsPerPage = 20;

  // 認証状態をチェック
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 履歴データ取得
  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 全データを取得 (大きな数値を指定)
      const data = await kanteiAPI.getHistory(1, 1000);


      // データをそのまま使用（検索・ソート機能は削除）
      const items = data.items || [];

      setHistoryData({
        ...data,
        items: items,
        total: items.length,
        total_pages: 1 // 直近10件のため常に1ページ
      });
    } catch (error: any) {
      console.error('履歴取得エラー:', error);
      if (error.response?.status === 500) {
        setErrorMessage('履歴データの取得に失敗しました。しばらく時間をおいて再度お試しください。');
      } else {
        setErrorMessage('履歴データの取得でエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login', { replace: true });
  };

  const handleBack = () => {
    navigate('/');
  };

  const getStatus = (item: HistoryItem) => {
    // 鑑定書が作成されている場合は成功とみなす
    // PDFが生成されていなくても、データが存在すれば成功
    if (item.pdf_generated === true) return 'completed';
    // IDが存在し、created_atがある場合は鑑定処理が完了しているとみなす
    if (item.id && item.created_at && item.client_name) return 'completed';
    return 'failed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'failed': return '失敗';
      default: return '不明';
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatKanteiId = (id: string | number) => {
    return `#${String(id).padStart(3, '0')}`;
  };

  // PDF印刷
  const handlePrint = async (kanteiId: string) => {
    try {
      console.log('PDF印刷開始:', kanteiId);
      const blob = await kanteiAPI.getPdf(kanteiId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
      console.log('PDF印刷成功');
    } catch (error) {
      console.error('PDF印刷エラー:', error);
      console.error('PDF印刷エラー詳細:', error.response);
      if (error.response?.status === 404) {
        setErrorMessage('PDFファイルが見つかりません。先にPDFを生成してから印刷してください。');
      } else {
        setErrorMessage('PDF印刷でエラーが発生しました。');
      }
    }
  };

  // Word出力
  const handleWordExport = async (kanteiId: string) => {
    try {
      const blob = await kanteiAPI.generateWord(kanteiId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kantei_${kanteiId}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Word出力エラー:', error);
      setErrorMessage('Word出力でエラーが発生しました。');
    }
  };



  return (
    <div>
      <AppBar position="fixed" className="header">
        <Toolbar>
          <Button
            style={{ color: 'inherit', marginRight: '16px' }}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            戻る
          </Button>
          <Typography variant="h6" component="h1" className="header-title" style={{ flexGrow: 1 }}>
            鑑定書履歴
          </Typography>
          <Button
            color="inherit"
            onClick={fetchHistory}
            startIcon={<RefreshIcon />}
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            更新
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

      <Box sx={{
        width: '100vw',
        maxWidth: 'none',
        margin: 0,
        padding: '32px 24px',
        paddingTop: '96px',
        paddingBottom: '80px',
        minHeight: 'calc(100vh - 96px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ヘッダー部分 - 固定位置 */}
        <Box className="page-header" sx={{
          maxWidth: '800px',
          margin: '0 auto 24px auto',
          marginTop: '48px',
          flex: '0 0 auto',
          minHeight: '90px'
        }}>
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
              鑑定書履歴
            </Typography>
            <Box sx={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #34495e 50%, transparent 100%)',
              ml: 3
            }} />
          </Box>
          <Typography variant="subtitle1" className="page-description" sx={{ mt: 3, textAlign: 'center' }}>
            直近10件の鑑定書のPDF印刷やWord出力が可能です
          </Typography>
        </Box>

        {/* エラーメッセージ */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: '800px', margin: '0 auto 24px auto' }}>
            {errorMessage}
          </Alert>
        )}

        {/* コンテンツエリア - 可変 */}
        <Box sx={{ flex: '1 1 auto' }}>
          {isLoading ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <CircularProgress />
            </Box>
          ) : historyData && historyData.items.length > 0 ? (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  maxWidth: '800px',
                  margin: '0 auto 24px auto'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>鑑定ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '100px', whiteSpace: 'nowrap' }}>ステータス</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>ご依頼者氏名</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>鑑定日時</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '120px' }}>アクション</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.items.map((item) => {
                      const status = getStatus(item);
                      return (
                        <TableRow
                          key={item.id}
                          sx={{
                            '&:hover': { bgcolor: 'grey.50' },
                            borderLeft: `4px solid ${status === 'completed' ? '#4caf50' : '#f44336'}`
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {formatKanteiId(item.id)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(status)}
                              color={getStatusColor(status) as any}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {item.client_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(item.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexDirection: 'row' }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePrint(item.id)}
                                startIcon={<PrintIcon fontSize="small" />}
                                sx={{
                                  bgcolor: '#1976d2',
                                  fontSize: '0.7rem',
                                  minWidth: '45px',
                                  height: '24px',
                                  padding: '2px 8px'
                                }}
                              >
                                PDF
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleWordExport(item.id)}
                                startIcon={<WordIcon fontSize="small" />}
                                sx={{
                                  bgcolor: '#2e7d32',
                                  fontSize: '0.7rem',
                                  minWidth: '45px',
                                  height: '24px',
                                  padding: '2px 8px'
                                }}
                              >
                                Word
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ページネーション - デバッグ用に条件を緩和 */}
              {historyData && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: 4,
                  maxWidth: '800px',
                  margin: '32px auto 0 auto'
                }}>
                  {historyData.total_pages > 1 && (
                    <Pagination
                      count={historyData.total_pages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  )}
                </Box>
              )}
            </>
          ) : (
            <Box sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
                minHeight: '400px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <Typography variant="h6" color="text.secondary">
                鑑定履歴がありません
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                新規作成ボタンから最初の鑑定書を作成してください
              </Typography>
            </Box>
          )}
        </Box>
      </Box>


      </div>
  );
};

export default HistoryPage;