import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  children: ReactNode;
  required?: boolean;
  tooltip?: string;
}

export function FormField({ 
  label, 
  error, 
  success, 
  children, 
  required, 
  tooltip 
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {tooltip && (
          <span className="ml-2 text-xs text-slate-500" title={tooltip}>
            ⓘ
          </span>
        )}
      </label>
      
      <div className="relative">
        {children}
        
        {/* Success indicator */}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = "", ...props }: InputProps) {
  const baseClass = "block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors";
  const errorClass = error 
    ? "border-red-300 text-red-900 placeholder-red-300" 
    : "border-slate-300 text-slate-900";
  
  return (
    <input
      className={`${baseClass} ${errorClass} ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export function Select({ error, options, className = "", ...props }: SelectProps) {
  const baseClass = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors";
  const errorClass = error 
    ? "border-red-300 text-red-900" 
    : "border-slate-300 text-slate-900";
  
  return (
    <select
      className={`${baseClass} ${errorClass} ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
