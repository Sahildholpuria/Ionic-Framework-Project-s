import React from 'react';
import { IonIcon } from '@ionic/react';
import { backspaceOutline } from 'ionicons/icons';
import { AngleMode } from '../utils/calculatorEngine';
import { feedback } from '../utils/hapticsAndSound';

interface ScientificKeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
  onInsertToken: (token: string, isFunc?: boolean) => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  hasMemory: boolean;
  isSecondMode: boolean;
  onToggleSecondMode: () => void;
  hasInput: boolean;
}

export const ScientificKeypad: React.FC<ScientificKeypadProps> = ({
  onDigit,
  onOperator,
  onClear,
  onBackspace,
  onEquals,
  onInsertToken,
  onMemoryAction,
  angleMode,
  onToggleAngleMode,
  hasMemory,
  isSecondMode,
  onToggleSecondMode,
  hasInput,
}) => {
  const handleKey = (token: string, isFunc: boolean = false) => {
    feedback.onKeyFeedback('operator');
    onInsertToken(token, isFunc);
  };

  const handleMem = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    feedback.onKeyFeedback('operator');
    onMemoryAction(action);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(7, 1fr)',
        gap: '6px',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Row 1: Scientific & Memory Controls */}
      <button
        className={`key-btn key-scientific ${isSecondMode ? 'active-toggle' : ''}`}
        onClick={onToggleSecondMode}
      >
        2nd
      </button>

      <button
        className="key-btn key-scientific"
        onClick={onToggleAngleMode}
        style={{ color: 'var(--accent-cyan)' }}
      >
        {angleMode}
      </button>

      <button
        className={`key-btn key-scientific ${hasMemory ? 'active-toggle' : ''}`}
        onClick={() => handleMem('MC')}
      >
        MC
      </button>

      <button
        className={`key-btn key-scientific ${hasMemory ? 'active-toggle' : ''}`}
        onClick={() => handleMem('MR')}
      >
        MR
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleMem('M+')}
      >
        M+
      </button>

      {/* Row 2: Trig & Log */}
      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'asin(' : 'sin(', true)}
      >
        {isSecondMode ? 'sin⁻¹' : 'sin'}
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'acos(' : 'cos(', true)}
      >
        {isSecondMode ? 'cos⁻¹' : 'cos'}
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'atan(' : 'tan(', true)}
      >
        {isSecondMode ? 'tan⁻¹' : 'tan'}
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'exp(' : 'ln(', true)}
      >
        {isSecondMode ? 'eˣ' : 'ln'}
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? '10^(' : 'log(', true)}
      >
        {isSecondMode ? '10ˣ' : 'log'}
      </button>

      {/* Row 3: Roots, Powers, Parentheses & Division */}
      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'cbrt(' : 'sqrt(', true)}
      >
        {isSecondMode ? '∛' : '√'}
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey('^')}
      >
        xʸ
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey('(')}
      >
        (
      </button>

      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(')')}
      >
        )
      </button>

      <button
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('÷');
        }}
      >
        ÷
      </button>

      {/* Row 4: 7, 8, 9, x!, Multiplication */}
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('7');
        }}
      >
        7
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('8');
        }}
      >
        8
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('9');
        }}
      >
        9
      </button>
      <button
        className="key-btn key-scientific"
        onClick={() => handleKey('!')}
      >
        x!
      </button>
      <button
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('×');
        }}
      >
        ×
      </button>

      {/* Row 5: 4, 5, 6, Pi, Subtraction */}
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('4');
        }}
      >
        4
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('5');
        }}
      >
        5
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('6');
        }}
      >
        6
      </button>
      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'φ' : 'π')}
        style={{ fontSize: 18 }}
      >
        {isSecondMode ? 'φ' : 'π'}
      </button>
      <button
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('−');
        }}
      >
        −
      </button>

      {/* Row 6: 1, 2, 3, e, Addition */}
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('1');
        }}
      >
        1
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('2');
        }}
      >
        2
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('3');
        }}
      >
        3
      </button>
      <button
        className="key-btn key-scientific"
        onClick={() => handleKey(isSecondMode ? 'rand()' : 'e')}
      >
        {isSecondMode ? 'RND' : 'e'}
      </button>
      <button
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('+');
        }}
      >
        +
      </button>

      {/* Row 7: AC, 0, ., Backspace, Equals */}
      <button
        className="key-btn key-action clear-btn"
        onClick={() => {
          feedback.onKeyFeedback('delete');
          onClear();
        }}
        title="All Clear"
      >
        AC
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('0');
        }}
      >
        0
      </button>
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('digit');
          onDigit('.');
        }}
      >
        .
      </button>
      <button
        className="key-btn key-action"
        onClick={() => {
          feedback.onKeyFeedback('delete');
          onBackspace();
        }}
      >
        <IonIcon icon={backspaceOutline} style={{ fontSize: 20 }} />
      </button>
      <button
        className="key-btn key-equals"
        onClick={() => {
          feedback.onKeyFeedback('equals');
          onEquals();
        }}
      >
        =
      </button>
    </div>
  );
};
