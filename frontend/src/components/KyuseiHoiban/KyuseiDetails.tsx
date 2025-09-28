import React from 'react';
import '../../styles/certificate-shared.css';

// 共通CSSクラスを使用するため、styled-componentsは削除

interface HouiDetail {
  houi: string;
  nenbanStar: number;
  getsubanStar: number;
  nippanStar: number | null;
  kichiType: string | null;
  kyouType: string | null;
}

interface BirthData {
  year: { name: string; rubi: string };
  month: {
    name: string;
    rubi: string;
    eto60?: { name: string; jikan: string; eto: string };
  };
  day: {
    name: string;
    rubi: string;
    eto60?: { name: string; jikan: string; eto: string };
  };
  eto60: {
    name: string;
    jikan: string;
    eto: string;
    nattin?: string;
  };
  keisha: string | null;
  keishaRubi: string | null;
}

interface KyuseiDetailsProps {
  birthData?: BirthData;
  formData?: {
    name: string;
    birthDate: string;
    birthTime?: string;
    gender: string;
  };
  targetDate: string;
  houiDetails?: HouiDetail[];
}

const KyuseiDetails: React.FC<KyuseiDetailsProps> = ({
  birthData,
  formData,
  targetDate,
  houiDetails
}) => {
  // 吉方・凶方の方位を集計
  const getDirectionSummary = () => {
    if (!houiDetails) return { saikichihou: [], kichihou: [], kyouhou: [] };

    const saikichihou = houiDetails.filter(h => h.kichiType === '最大吉方').map(h => h.houi);
    const kichihou = houiDetails.filter(h => h.kichiType === '吉方').map(h => h.houi);
    const kyouhou = houiDetails.filter(h => h.kyouType).map(h => `${h.houi}(${h.kyouType})`);

    return { saikichihou, kichihou, kyouhou };
  };

  const { saikichihou, kichihou, kyouhou } = getDirectionSummary();

  return (
    <div className="certificate-details-card">
      <h3 className="certificate-details-main-title">
        詳細情報
      </h3>

        {/* 基本情報 */}
        <h4 className="certificate-details-section-title">基本情報</h4>
        <div style={{ marginBottom: 'var(--certificate-spacing-md)' }}>
          {formData && (
            <>
              <div className="certificate-details-info-row">
                <span className="certificate-details-info-label">生年月日</span>
                <span className="certificate-details-info-value">{formData.birthDate}</span>
              </div>
              <div className="certificate-details-info-row">
                <span className="certificate-details-info-label">性別</span>
                <span className="certificate-details-info-value">
                  {formData.gender === 'male' ? '男性' : '女性'}
                </span>
              </div>
              {formData.birthTime && (
                <div className="certificate-details-info-row">
                  <span className="certificate-details-info-label">出生時間</span>
                  <span className="certificate-details-info-value">{formData.birthTime}</span>
                </div>
              )}
            </>
          )}
          <div className="certificate-details-info-row">
            <span className="certificate-details-info-label">鑑定日</span>
            <span className="certificate-details-info-value">{targetDate}</span>
          </div>
        </div>

        {/* 九星情報 */}
        {birthData && (
          <>
            <h4 className="certificate-details-section-title">九星情報</h4>
            <div style={{ marginBottom: 'var(--certificate-spacing-md)' }}>
              <div className="certificate-details-info-row">
                <span className="certificate-details-info-label">本命星</span>
                <span className="certificate-details-info-value primary">
                  {birthData.year.name}
                </span>
              </div>
              <div className="certificate-details-info-row">
                <span className="certificate-details-info-label">月命星</span>
                <span className="certificate-details-info-value primary">
                  {birthData.month.name}
                </span>
              </div>
              <div className="certificate-details-info-row">
                <span className="certificate-details-info-label">日命星</span>
                <span className="certificate-details-info-value primary">
                  {birthData.day.name}
                </span>
              </div>
              {birthData.eto60 && (
                <>
                  <div className="certificate-details-info-row">
                    <span className="certificate-details-info-label">年干支</span>
                    <span className="certificate-details-info-value">
                      {birthData.eto60.name}
                    </span>
                  </div>
                  {birthData.month.eto60 && (
                    <div className="certificate-details-info-row">
                      <span className="certificate-details-info-label">月干支</span>
                      <span className="certificate-details-info-value">
                        {birthData.month.eto60.name}
                      </span>
                    </div>
                  )}
                  {birthData.day.eto60 && (
                    <div className="certificate-details-info-row">
                      <span className="certificate-details-info-label">日干支</span>
                      <span className="certificate-details-info-value">
                        {birthData.day.eto60.name}
                      </span>
                    </div>
                  )}
                  <div className="certificate-details-info-row">
                    <span className="certificate-details-info-label">納音</span>
                    <span className="certificate-details-info-value">
                      {birthData.eto60.nattin || '未実装'}
                    </span>
                  </div>
                </>
              )}
              {birthData.keisha && (
                <div className="certificate-details-info-row">
                  <span className="certificate-details-info-label">傾斜</span>
                  <span className="certificate-details-info-value">
                    {birthData.keisha}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* 吉凶方位 */}
        <h4 className="certificate-details-section-title">吉凶方位</h4>
        <div style={{ marginBottom: 'var(--certificate-spacing-md)' }}>
          <div style={{ marginBottom: 'var(--certificate-spacing-sm)' }}>
            <div className="certificate-details-info-label" style={{ marginBottom: 'var(--certificate-spacing-xs)' }}>
              最大吉方
            </div>
            <div className="certificate-chip-container">
              {saikichihou.length > 0 ? (
                saikichihou.map(direction => (
                  <span
                    key={direction}
                    className="certificate-chip primary"
                  >
                    {direction}
                  </span>
                ))
              ) : (
                <span className="certificate-details-info-label">なし</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--certificate-spacing-sm)' }}>
            <div className="certificate-details-info-label" style={{ marginBottom: 'var(--certificate-spacing-xs)' }}>
              吉方
            </div>
            <div className="certificate-chip-container">
              {kichihou.length > 0 ? (
                kichihou.map(direction => (
                  <span
                    key={direction}
                    className="certificate-chip secondary"
                  >
                    {direction}
                  </span>
                ))
              ) : (
                <span className="certificate-details-info-label">なし</span>
              )}
            </div>
          </div>

          <div>
            <div className="certificate-details-info-label" style={{ marginBottom: 'var(--certificate-spacing-xs)' }}>
              凶方
            </div>
            <div className="certificate-chip-container">
              {kyouhou.length > 0 ? (
                kyouhou.map(direction => (
                  <span
                    key={direction}
                    className="certificate-chip error"
                  >
                    {direction}
                  </span>
                ))
              ) : (
                <span className="certificate-details-info-label">なし</span>
              )}
            </div>
          </div>
        </div>

        {/* 方位詳細テーブル */}
        {houiDetails && (
          <>
            <h4 className="certificate-details-section-title">方位詳細</h4>
            <table className="certificate-table">
              <thead>
                <tr>
                  <th>方位</th>
                  <th>年盤</th>
                  <th>月盤</th>
                  <th>日盤</th>
                  <th>判定</th>
                </tr>
              </thead>
              <tbody>
                  {houiDetails.map((detail, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '500' }}>
                        {detail.houi}
                      </td>
                      <td>
                        {detail.nenbanStar}
                      </td>
                      <td>
                        {detail.getsubanStar}
                      </td>
                      <td>
                        {detail.nippanStar || '-'}
                      </td>
                      <td>
                        {detail.kyouType ? (
                          <span className="certificate-chip error">
                            {detail.kyouType}
                          </span>
                        ) : detail.kichiType ? (
                          <span className={`certificate-chip ${detail.kichiType === '最大吉方' ? 'primary' : 'secondary'}`}>
                            {detail.kichiType}
                          </span>
                        ) : (
                          <span className="certificate-details-info-label">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {/* 注意書き */}
        <div className="certificate-alert">
          一部の機能は開発中です。詳細な分析結果は今後のアップデートで追加予定です。
        </div>
    </div>
  );
};

export default KyuseiDetails;