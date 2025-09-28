import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, getAuthToken } from '../../services/api';
import './styles.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: 'test@example.com', // デフォルト値を設定
    password: 'testpass123'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // 既にログイン済みの場合は/createにリダイレクト
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      navigate('/create', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleAutoFill = () => {
    setFormData({
      email: 'test@example.com',
      password: 'testpass123'
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 実際のAPI呼び出し
      const result = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      console.log('Login successful:', result);
      setSuccessMessage('ログインに成功しました');

      // 少し待ってからリダイレクト
      setTimeout(() => {
        navigate('/create', { replace: true });
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);

      // エラーメッセージの詳細化
      if (error.response?.status === 401) {
        setErrorMessage('メールアドレスまたはパスワードが正しくありません。');
      } else if (error.response?.status === 422) {
        setErrorMessage('入力形式が正しくありません。');
      } else if (error.code === 'ECONNREFUSED') {
        setErrorMessage('サーバーに接続できません。管理者にお問い合わせください。');
      } else {
        setErrorMessage('ログインに失敗しました。しばらく時間をおいて再度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-line"></div>
            <div className="logo">運命織</div>
            <div className="logo-line"></div>
          </div>
          <div className="subtitle">プロフェッショナル鑑定書作成システム</div>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="error-message" role="alert" aria-live="polite">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="success-message" role="alert" aria-live="polite">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              data-testid="email-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="パスワードを入力"
              required
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
            data-testid="login-button"
          >
            <div className="button-content">
              {isLoading && <div className="loading-spinner"></div>}
              <span>{isLoading ? 'ログイン中...' : 'ログイン'}</span>
            </div>
          </button>

          <button
            type="button"
            className="test-account-button"
            onClick={handleAutoFill}
            data-testid="test-account-button"
          >
            テストアカウントで入力
          </button>
        </form>

        <div className="utage-info">
          <p>鑑定業務の効率化を実現する専門ツールにアクセスしてください</p>
          <div className="utage-badge">
            🔒 セキュア認証
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;