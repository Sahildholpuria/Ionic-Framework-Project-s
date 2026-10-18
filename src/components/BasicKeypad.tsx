import React from 'react';
import { IonIcon } from '@ionic/react';
import { backspaceOutline } from 'ionicons/icons';
import { feedback } from '../utils/hapticsAndSound';

interface BasicKeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onPercentage: () => void;
  onEquals: () => void;
  hasInput: boolean;
}

export const BasicKeypad: React.FC<BasicKeypadProps> = ({
  onDigit,
  onOperator,
  onClear,
  onBackspace,
  onToggleSign,
  onPercentage,
  onEquals,
  hasInput,
}) => {
  return (
    <div className="grid-basic">
      {/* Row 1 */}
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
        className="key-btn key-action"
        onClick={() => {
          feedback.onKeyFeedback('delete');
          onBackspace();
        }}
        title="Backspace"
      >
        <IonIcon icon={backspaceOutline} style={{ fontSize: 24 }} />
      </button>

      <button
        className="key-btn key-action"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onPercentage();
        }}
        title="Percent"
      >
        %
      </button>

      <button
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('÷');
        }}
        title="Divide"
      >
        ÷
      </button>

      {/* Row 2 */}
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
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('×');
        }}
        title="Multiply"
      >
        ×
      </button>

      {/* Row 3 */}
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
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('−');
        }}
        title="Subtract"
      >
        −
      </button>

      {/* Row 4 */}
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
        className="key-btn key-operator"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onOperator('+');
        }}
        title="Add"
      >
        +
      </button>

      {/* Row 5 */}
      <button
        className="key-btn key-number"
        onClick={() => {
          feedback.onKeyFeedback('operator');
          onToggleSign();
        }}
        title="Invert Sign"
      >
        ±
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
        className="key-btn key-equals"
        onClick={() => {
          feedback.onKeyFeedback('equals');
          onEquals();
        }}
        title="Calculate Result"
      >
        =
      </button>
    </div>
  );
};
