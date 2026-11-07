import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, Check, Delete, X } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
  actionDescription?: string;
}

const REQUIRED_PIN = '0852';

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Security PIN Required',
  actionDescription = 'Enter the 4-digit trip PIN to confirm deletion.',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === REQUIRED_PIN) {
      setIsSuccess(true);
      setError(null);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 300);
    } else {
      setError('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 4 || isSuccess) return;
    setError(null);
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      verifyPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !isSuccess) {
      setError(null);
      setPin(pin.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    setError(null);
    if (val.length === 4) {
      verifyPin(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-[#192B3D] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="p-5 text-center bg-[#F7F8F5] border-b border-[#E4EAF0] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-[#718096] hover:text-[#192B3D] hover:bg-[#E4EAF0] transition"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
              isSuccess
                ? 'bg-[#145B4A] text-white'
                : error
                ? 'bg-rose-100 text-rose-600'
                : 'bg-[#78C5A7]/20 text-[#145B4A]'
            }`}
          >
            {isSuccess ? (
              <Check className="w-7 h-7 stroke-[3]" />
            ) : error ? (
              <ShieldAlert className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>

          <h3 className="mt-3 text-lg font-black text-[#192B3D] tracking-tight">
            {isSuccess ? 'PIN Verified!' : actionTitle}
          </h3>
          <p className="mt-1 text-xs text-[#718096] font-medium px-4">
            {isSuccess ? 'Action confirmed.' : actionDescription}
          </p>
        </div>

        {/* PIN Input Section */}
        <div className="p-5 flex flex-col items-center">
          {/* Hidden native input for physical keyboard entry */}
          <label htmlFor="pin-code-input" className="sr-only">
            Security PIN code
          </label>
          <input
            id="pin-code-input"
            name="pin"
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={handleInputChange}
            autoComplete="off"
            aria-label="Security PIN code"
            className="sr-only"
            autoFocus
          />

          {/* 4-Digit Display Boxes */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex justify-center gap-3.5 my-2 cursor-pointer"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              const isCurrent = pin.length === idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${
                    isSuccess
                      ? 'border-2 border-[#145B4A] bg-[#78C5A7]/15 text-[#145B4A] scale-105'
                      : error
                      ? 'border-2 border-[#FF784F] bg-rose-50 text-[#FF784F] animate-pulse'
                      : isFilled
                      ? 'border-2 border-[#78C5A7] bg-[#78C5A7]/15 text-[#145B4A] shadow-inner'
                      : isCurrent
                      ? 'border-2 border-[#145B4A] bg-white shadow-sm ring-2 ring-[#78C5A7]/30'
                      : 'border-2 border-[#E4EAF0] bg-[#F7F8F5] text-[#718096]'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs font-bold text-[#FF784F] bg-rose-50 border border-[#FF784F]/30 px-3 py-1 rounded-full mt-2 animate-bounce">
              {error}
            </div>
          )}

          {!error && !isSuccess && (
            <p className="text-[11px] text-[#718096] mt-2 font-medium">
              Enter 4-digit security PIN to proceed
            </p>
          )}

          {/* Mobile-Friendly Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full mt-5 max-w-[260px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitPress(digit)}
                className="h-12 rounded-xl bg-[#F7F8F5] hover:bg-[#E4EAF0] active:bg-[#78C5A7]/20 active:scale-95 text-xl font-bold text-[#192B3D] transition shadow-2xs flex items-center justify-center border border-[#E4EAF0]"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl bg-white hover:bg-[#F7F8F5] active:scale-95 text-xs font-bold text-[#718096] transition flex items-center justify-center border border-[#E4EAF0]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              className="h-12 rounded-xl bg-[#F7F8F5] hover:bg-[#E4EAF0] active:bg-[#78C5A7]/20 active:scale-95 text-xl font-bold text-[#192B3D] transition shadow-2xs flex items-center justify-center border border-[#E4EAF0]"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-[#F7F8F5] hover:bg-rose-50 active:scale-95 text-[#718096] hover:text-[#FF784F] transition shadow-2xs flex items-center justify-center border border-[#E4EAF0]"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
