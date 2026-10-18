import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonToast,
} from '@ionic/react';
import {
  timeOutline,
  settingsOutline,
  calculatorOutline,
  swapHorizontalOutline,
  receiptOutline,
  copyOutline,
} from 'ionicons/icons';
import {
  CalculatorEngine,
  AngleMode,
  MemoryState,
} from '../utils/calculatorEngine';
import { HistoryManager, HistoryItem } from '../utils/historyManager';
import { ThemeManager } from '../utils/themeManager';
import { feedback } from '../utils/hapticsAndSound';
import { BasicKeypad } from '../components/BasicKeypad';
import { ScientificKeypad } from '../components/ScientificKeypad';
import { UnitConverterView } from '../components/UnitConverterView';
import { TipSplitView } from '../components/TipSplitView';
import { HistoryModal } from '../components/HistoryModal';
import { SettingsModal } from '../components/SettingsModal';

import '../theme/calculator.css';

type MainTab = 'calculator' | 'converter' | 'split';
type CalcSubMode = 'basic' | 'scientific';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('calculator');
  const [calcSubMode, setCalcSubMode] = useState<CalcSubMode>('basic');

  const [expression, setExpression] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [lastCalculated, setLastCalculated] = useState<{ expr: string; res: string } | null>(null);

  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);
  const [memoryState, setMemoryState] = useState<MemoryState>({ value: 0, hasValue: false });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const engineRef = useRef<CalculatorEngine>(new CalculatorEngine(angleMode));
  const exprDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ThemeManager.init();
  }, []);

  useEffect(() => {
    engineRef.current.setAngleMode(angleMode);
    if (expression) {
      updateLivePreview(expression);
    }
  }, [angleMode]);

  useEffect(() => {
    if (exprDisplayRef.current) {
      exprDisplayRef.current.scrollLeft = exprDisplayRef.current.scrollWidth;
    }
  }, [expression]);

  const updateLivePreview = (expr: string) => {
    if (!expr || expr.trim() === '') {
      setPreviewResult(null);
      return;
    }
    const preview = engineRef.current.preview(expr);
    setPreviewResult(preview);
  };

  const handleDigit = (digit: string) => {
    setExpression((prev) => {
      let next = prev;
      if (prev === '0' && digit !== '.') {
        next = digit;
      } else {
        next = prev + digit;
      }
      updateLivePreview(next);
      return next;
    });
  };

  const handleOperator = (op: string) => {
    setExpression((prev) => {
      if (!prev && lastCalculated && op !== '(') {
        const next = lastCalculated.res.replace(/,/g, '') + ' ' + op + ' ';
        updateLivePreview(next);
        return next;
      }

      if (!prev) {
        if (op === '−' || op === '-') return '-';
        return prev;
      }

      const trimmed = prev.trim();
      const lastChar = trimmed.slice(-1);

      if (['+', '−', '-', '×', '*', '÷', '/'].includes(lastChar)) {
        const next = trimmed.slice(0, -1).trim() + ' ' + op + ' ';
        updateLivePreview(next);
        return next;
      }

      const next = prev + ' ' + op + ' ';
      updateLivePreview(next);
      return next;
    });
  };

  const handleClear = () => {
    setExpression('');
    setPreviewResult(null);
    setLastCalculated(null);
  };

  const handleBackspace = () => {
    setExpression((prev) => {
      if (!prev) return '';
      let next = prev.trimEnd();

      const funcMatch = next.match(/(asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|sin|cos|tan|sqrt|cbrt|ln|log|exp|abs|rand\(\))\($/);
      if (funcMatch) {
        next = next.slice(0, -funcMatch[0].length);
      } else if (next.endsWith(' ')) {
        next = next.slice(0, -2);
      } else {
        next = next.slice(0, -1);
      }

      updateLivePreview(next);
      return next;
    });
  };

  const handleToggleSign = () => {
    setExpression((prev) => {
      if (!prev) return '-';
      const regex = /(-?\d+(\.\d+)?)$/;
      const match = prev.match(regex);
      if (match) {
        const numStr = match[1];
        let flipped = numStr.startsWith('-') ? numStr.substring(1) : '-' + numStr;
        const next = prev.slice(0, -numStr.length) + flipped;
        updateLivePreview(next);
        return next;
      }
      return prev;
    });
  };

  const handlePercentage = () => {
    setExpression((prev) => {
      if (!prev) return prev;
      const next = prev + '%';
      updateLivePreview(next);
      return next;
    });
  };

  const handleEquals = () => {
    if (!expression || expression.trim() === '') return;

    const evalResult = engineRef.current.evaluate(expression);

    if (evalResult.success) {
      const formattedRes = evalResult.result;
      setLastCalculated({ expr: expression, res: formattedRes });
      HistoryManager.addEntry(expression, formattedRes, calcSubMode === 'scientific' ? 'scientific' : 'basic');
      setExpression(formattedRes.replace(/,/g, ''));
      setPreviewResult(null);
    } else {
      setPreviewResult(evalResult.result || 'Error');
    }
  };

  const handleInsertToken = (token: string, isFunc: boolean = false) => {
    setExpression((prev) => {
      let next = prev;
      if (prev === '0' && isFunc) {
        next = token;
      } else {
        next = prev + token;
      }
      updateLivePreview(next);
      return next;
    });
  };

  const handleMemoryAction = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const curVal = parseFloat(previewResult?.replace(/,/g, '') || expression.replace(/,/g, '') || '0');

    if (action === 'MC') {
      engineRef.current.memoryClear();
      setToastMsg('Memory Cleared');
    } else if (action === 'MR') {
      const recalled = engineRef.current.memoryRecall();
      handleDigit(recalled.toString());
      setToastMsg(`Recalled: ${recalled}`);
    } else if (action === 'M+') {
      engineRef.current.memoryAdd(curVal);
      setToastMsg(`M+ (${curVal})`);
    } else if (action === 'M-') {
      engineRef.current.memorySubtract(curVal);
      setToastMsg(`M- (${curVal})`);
    } else if (action === 'MS') {
      engineRef.current.memoryStore(curVal);
      setToastMsg(`Stored: ${curVal}`);
    }

    setMemoryState(engineRef.current.getMemoryState());
  };

  const handleToggleAngleMode = () => {
    feedback.onKeyFeedback('operator');
    const modes: AngleMode[] = ['DEG', 'RAD', 'GRAD'];
    const nextIdx = (modes.indexOf(angleMode) + 1) % modes.length;
    setAngleMode(modes[nextIdx]);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setExpression(item.expression);
    updateLivePreview(item.expression);
    setLastCalculated({ expr: item.expression, res: item.result });
  };

  const handleCopyCurrent = async () => {
    const textToCopy = previewResult || expression || '0';
    feedback.onKeyFeedback('digit');
    const ok = await HistoryManager.copyToClipboard(textToCopy);
    if (ok) {
      setToastMsg(`Copied "${textToCopy}"`);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isHistoryOpen || isSettingsOpen || activeTab !== 'calculator') return;

      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        handleDigit(key);
      } else if (key === '.') {
        handleDigit('.');
      } else if (key === '+' || key === '-') {
        handleOperator(key === '-' ? '−' : '+');
      } else if (key === '*') {
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        handleClear();
      } else if (key === '(' || key === ')') {
        handleInsertToken(key);
      } else if (key === '^') {
        handleInsertToken('^');
      } else if (key === '%') {
        handlePercentage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expression, previewResult, lastCalculated, isHistoryOpen, isSettingsOpen, activeTab]);

  const getExprClass = () => {
    if (expression.length > 20) return 'micro';
    if (expression.length > 12) return 'compact';
    return '';
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} className="calc-content-wrapper">
        <div className="app-viewport">
          {/* Top Bar */}
          <div className="calc-top-bar">
            {activeTab === 'calculator' ? (
              <div className="calc-segment">
                <button
                  className={`segment-btn ${calcSubMode === 'basic' ? 'active' : ''}`}
                  onClick={() => {
                    feedback.onKeyFeedback('operator');
                    setCalcSubMode('basic');
                  }}
                >
                  Basic
                </button>
                <button
                  className={`segment-btn ${calcSubMode === 'scientific' ? 'active' : ''}`}
                  onClick={() => {
                    feedback.onKeyFeedback('operator');
                    setCalcSubMode('scientific');
                  }}
                >
                  Advance
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 18, fontWeight: 700, paddingLeft: 4 }}>
                {activeTab === 'converter' ? 'Unit Converter' : 'Tip & Split Bill'}
              </div>
            )}

            <div className="top-actions">
              {activeTab === 'calculator' && (
                <button className="angle-chip" onClick={handleToggleAngleMode} title="Angle Unit">
                  {angleMode}
                </button>
              )}

              <button
                className="action-circle-btn"
                onClick={() => {
                  feedback.onKeyFeedback('digit');
                  setIsHistoryOpen(true);
                }}
                title="History"
              >
                <IonIcon icon={timeOutline} />
              </button>

              <button
                className="action-circle-btn"
                onClick={() => {
                  feedback.onKeyFeedback('digit');
                  setIsSettingsOpen(true);
                }}
                title="Settings"
              >
                <IonIcon icon={settingsOutline} />
              </button>
            </div>
          </div>

          {/* Active View */}
          {activeTab === 'converter' ? (
            <UnitConverterView />
          ) : activeTab === 'split' ? (
            <TipSplitView />
          ) : (
            <div className="calc-main-body">
              {/* Display Area */}
              <div className="calc-display-section">
                <div className="display-status-row">
                  <div className="status-chips">
                    <span
                      className={`status-badge ${memoryState.hasValue ? 'active' : ''}`}
                      title={memoryState.hasValue ? `Memory: ${memoryState.value}` : 'No memory'}
                    >
                      M{memoryState.hasValue ? `:${memoryState.value}` : ''}
                    </span>
                    {calcSubMode === 'scientific' && isSecondMode && (
                      <span className="status-badge active">2nd</span>
                    )}
                  </div>

                  <button
                    className="action-circle-btn"
                    style={{ width: 28, height: 28, fontSize: 14, border: 'none', background: 'transparent' }}
                    onClick={handleCopyCurrent}
                    title="Copy"
                  >
                    <IonIcon icon={copyOutline} />
                  </button>
                </div>

                <div className="history-breadcrumb">
                  {lastCalculated ? `${lastCalculated.expr} = ${lastCalculated.res}` : ''}
                </div>

                <div className="expression-scroll-container" ref={exprDisplayRef}>
                  <div className={`expression-text ${getExprClass()}`}>
                    {expression || '0'}
                  </div>
                </div>

                <div className="live-preview-row">
                  {previewResult ? (
                    <>
                      <span className="eq-symbol">=</span>
                      <span>{previewResult}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Keypad Container (Scaled dynamically, never scrolls) */}
              <div className="calc-keypad-wrapper">
                {calcSubMode === 'basic' ? (
                  <BasicKeypad
                    onDigit={handleDigit}
                    onOperator={handleOperator}
                    onClear={handleClear}
                    onBackspace={handleBackspace}
                    onToggleSign={handleToggleSign}
                    onPercentage={handlePercentage}
                    onEquals={handleEquals}
                    hasInput={expression.length > 0}
                  />
                ) : (
                  <ScientificKeypad
                    onDigit={handleDigit}
                    onOperator={handleOperator}
                    onClear={handleClear}
                    onBackspace={handleBackspace}
                    onEquals={handleEquals}
                    onInsertToken={handleInsertToken}
                    onMemoryAction={handleMemoryAction}
                    angleMode={angleMode}
                    onToggleAngleMode={handleToggleAngleMode}
                    hasMemory={memoryState.hasValue}
                    isSecondMode={isSecondMode}
                    onToggleSecondMode={() => setIsSecondMode(!isSecondMode)}
                    hasInput={expression.length > 0}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="bottom-nav">
            <button
              className={`nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => {
                feedback.onKeyFeedback('operator');
                setActiveTab('calculator');
              }}
            >
              <IonIcon icon={calculatorOutline} />
              <span>Calculator</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'converter' ? 'active' : ''}`}
              onClick={() => {
                feedback.onKeyFeedback('operator');
                setActiveTab('converter');
              }}
            >
              <IonIcon icon={swapHorizontalOutline} />
              <span>Converter</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'split' ? 'active' : ''}`}
              onClick={() => {
                feedback.onKeyFeedback('operator');
                setActiveTab('split');
              }}
            >
              <IonIcon icon={receiptOutline} />
              <span>Split Bill</span>
            </button>
          </div>

          {/* History Sheet */}
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onSelectCalculation={handleSelectHistoryItem}
          />

          {/* Settings Sheet */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            angleMode={angleMode}
            onAngleModeChange={(m) => setAngleMode(m)}
          />

          {/* Toast */}
          <IonToast
            isOpen={!!toastMsg}
            message={toastMsg || ''}
            duration={1500}
            onDidDismiss={() => setToastMsg(null)}
            position="bottom"
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
