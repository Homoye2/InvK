import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRIES = [
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal', dial: '+221' },
  { code: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire", dial: '+225' },
  { code: 'ML', flag: '🇲🇱', name: 'Mali', dial: '+223' },
  { code: 'BF', flag: '🇧🇫', name: 'Burkina Faso', dial: '+226' },
  { code: 'GN', flag: '🇬🇳', name: 'Guinée', dial: '+224' },
  { code: 'TG', flag: '🇹🇬', name: 'Togo', dial: '+228' },
  { code: 'BJ', flag: '🇧🇯', name: 'Bénin', dial: '+229' },
  { code: 'NE', flag: '🇳🇪', name: 'Niger', dial: '+227' },
  { code: 'MR', flag: '🇲🇷', name: 'Mauritanie', dial: '+222' },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroun', dial: '+237' },
  { code: 'FR', flag: '🇫🇷', name: 'France', dial: '+33' },
];

interface Props {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({ value, onChange, placeholder = '77 123 45 67', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const detectCountry = () => {
    for (const c of COUNTRIES) {
      const stripped = c.dial.replace('+', '');
      if (value.startsWith(c.dial)) return { country: c, local: value.slice(c.dial.length) };
      if (value.startsWith(stripped)) return { country: c, local: value.slice(stripped.length) };
    }
    return { country: COUNTRIES[0], local: value };
  };

  const { country, local } = detectCountry();

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    onChange(country.dial + cleaned);
  };

  const handleCountrySelect = (c: typeof COUNTRIES[0]) => {
    setOpen(false);
    onChange(c.dial + local);
  };

  return (
    <div ref={ref} className={`relative flex items-stretch border border-gray-300 rounded-lg overflow-visible bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent ${className}`}>
      {/* Dial code button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors flex-shrink-0 rounded-l-lg"
      >
        <span className="text-lg leading-none">{country.flag}</span>
        <span className="text-sm font-semibold text-gray-700">{country.dial}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Number input */}
      <input
        type="tel"
        value={local}
        onChange={handleLocalChange}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-white outline-none rounded-r-lg"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCountrySelect(c)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${c.code === country.code ? 'bg-blue-50' : ''}`}
            >
              <span className="text-xl">{c.flag}</span>
              <span className="flex-1 text-gray-800">{c.name}</span>
              <span className="text-gray-500 font-mono text-xs">{c.dial}</span>
              {c.code === country.code && <span className="text-blue-600 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
