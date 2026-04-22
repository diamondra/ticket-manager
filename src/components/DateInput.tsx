import { useRef, useState, useEffect } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

export function DateInput({ value, onChange, required }: DateInputProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Sync from parent value (YYYY-MM-DD)
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, []);

  const emit = (d: string, m: string, y: string) => {
    if (d && m && y && y.length === 4) {
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange('');
    }
  };

  const handleDay = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    const num = Number(digits);

    if (digits.length === 2) {
      const clamped = Math.min(Math.max(num, 1), 31);
      const padded = pad(clamped, 2);
      setDay(padded);
      emit(padded, month, year);
      monthRef.current?.focus();
    } else {
      setDay(digits);
      // Auto-advance if first digit is 4-9 (can only be 04-09)
      if (digits.length === 1 && num >= 4) {
        const padded = pad(num, 2);
        setDay(padded);
        emit(padded, month, year);
        monthRef.current?.focus();
      }
    }
  };

  const handleMonth = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    const num = Number(digits);

    if (digits.length === 2) {
      const clamped = Math.min(Math.max(num, 1), 12);
      const padded = pad(clamped, 2);
      setMonth(padded);
      emit(day, padded, year);
      yearRef.current?.focus();
    } else {
      setMonth(digits);
      if (digits.length === 1 && num >= 2) {
        const padded = pad(num, 2);
        setMonth(padded);
        emit(day, padded, year);
        yearRef.current?.focus();
      }
    }
  };

  const handleYear = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setYear(digits);
    if (digits.length === 4) {
      emit(day, month, digits);
    }
  };

  const handleDayBlur = () => {
    if (day && day.length === 1) {
      const padded = pad(Number(day), 2);
      setDay(padded);
      emit(padded, month, year);
    }
  };

  const handleMonthBlur = () => {
    if (month && month.length === 1) {
      const padded = pad(Number(month), 2);
      setMonth(padded);
      emit(day, padded, year);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentValue: string,
    prevRef?: React.RefObject<HTMLInputElement | null>,
  ) => {
    if (e.key === 'Backspace' && currentValue === '' && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  return (
    <div className="date-input">
      <input
        ref={dayRef}
        className="date-input__field date-input__field--short"
        type="text"
        inputMode="numeric"
        placeholder="DD"
        value={day}
        onChange={e => handleDay(e.target.value)}
        onBlur={handleDayBlur}
        required={required}
      />
      <span className="date-input__sep">/</span>
      <input
        ref={monthRef}
        className="date-input__field date-input__field--short"
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={month}
        onChange={e => handleMonth(e.target.value)}
        onBlur={handleMonthBlur}
        onKeyDown={e => handleKeyDown(e, month, dayRef)}
        required={required}
      />
      <span className="date-input__sep">/</span>
      <input
        ref={yearRef}
        className="date-input__field date-input__field--long"
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        value={year}
        onChange={e => handleYear(e.target.value)}
        onKeyDown={e => handleKeyDown(e, year, monthRef)}
        required={required}
      />
    </div>
  );
}
