import React from 'react';

export function Input({ id, type = "text", label, value, onChange, ...props }) {
        const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`; 
    const isEmailInvalid = type === 'email' && value && !/\S+@\S+\.\S+/.test(value); 

    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>} 
            </label>
            <input
                id={inputId}
                name={inputId}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                    ${isEmailInvalid ? 'border-red-500' : 'border-gray-300'} 
                    ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'placeholder-gray-400'}`}
                // All other props are spread automatically
                {...props} 
            />
            {isEmailInvalid && <p className="mt-1 text-xs text-red-600">Please enter a valid email format.</p>}
        </div>
    );
}