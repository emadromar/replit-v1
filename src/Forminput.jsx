import React from 'react';

export function Input({ id, type = "text", label, value, onChange, className = "", ...props }) {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`; 
    const isEmailInvalid = type === 'email' && value && !/\S+@\S+\.\S+/.test(value); 

    return (
        <div className={className}>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {props.required && <span className="text-red-500 ml-0.5">*</span>} 
            </label>
            <input
                id={inputId}
                name={inputId}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                // We use the new global .input class here
                className={`input ${isEmailInvalid ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} ${props.disabled ? 'opacity-60' : ''}`}
                {...props} 
            />
            {isEmailInvalid && <p className="mt-1.5 text-xs text-red-600 flex items-center">Please enter a valid email address.</p>}
        </div>
    );
}