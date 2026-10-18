import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonToast,
} from '@ionic/react';
import {
  trashOutline,
  closeOutline,
  copyOutline,
  timeOutline,
  calculatorOutline,
} from 'ionicons/icons';
import { HistoryItem, HistoryManager } from '../utils/historyManager';
import { feedback } from '../utils/hapticsAndSound';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculation: (item: HistoryItem) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectCalculation,
}) => {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setHistory(HistoryManager.getHistory());
    }
  }, [isOpen]);

  const handleClear = () => {
    feedback.onKeyFeedback('delete');
    HistoryManager.clearHistory();
    setHistory([]);
    setToastMessage('Calculation history cleared');
  };

  const handleCopy = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    feedback.onKeyFeedback('digit');
    const success = await HistoryManager.copyToClipboard(text);
    if (success) {
      setToastMessage(`Copied "${text}" to clipboard`);
    }
  };

  const handleSelect = (item: HistoryItem) => {
    feedback.onKeyFeedback('digit');
    onSelectCalculation(item);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.65} breakpoints={[0, 0.65, 0.95]}>
      <div className="history-sheet">
        <div className="history-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IonIcon icon={timeOutline} style={{ fontSize: 22, color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 17, fontWeight: 700 }}>Calculation History</span>
            {history.length > 0 && (
              <span className="badge-pill">{history.length}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="history-clear-btn"
              onClick={handleClear}
              disabled={history.length === 0}
              title="Clear All History"
            >
              <IonIcon icon={trashOutline} style={{ fontSize: 16 }} />
              <span>Clear</span>
            </button>
            <button
              className="action-circle-btn"
              onClick={onClose}
              title="Close"
              aria-label="Close History"
            >
              <IonIcon icon={closeOutline} style={{ fontSize: 22, color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-history">
              <IonIcon icon={calculatorOutline} style={{ fontSize: 44, opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 500 }}>No recent calculations</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Your calculation timeline will appear here
              </div>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-card"
                onClick={() => handleSelect(item)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="history-time">
                    <IonIcon icon={timeOutline} />
                    {HistoryManager.formatTimestamp(item.timestamp)}
                  </span>
                  <button
                    className="action-circle-btn"
                    style={{ width: 32, height: 32, fontSize: 16 }}
                    onClick={(e) => handleCopy(e, item.result)}
                    title="Copy result"
                  >
                    <IonIcon icon={copyOutline} />
                  </button>
                </div>
                <div className="history-expr">{item.expression} =</div>
                <div className="history-res">{item.result}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ''}
        duration={1800}
        onDidDismiss={() => setToastMessage(null)}
        position="bottom"
      />
    </IonModal>
  );
};
