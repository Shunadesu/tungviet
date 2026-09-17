import { useState, useCallback } from 'react';

/**
 * useQuoteFormValidation — real-time, field-level validation for the quote form.
 *
 * Usage:
 *   const { fields, validate, validateField, clearErrors, isValid } = useQuoteFormValidation();
 *
 *   // On each keystroke (debounced in the component):
 *   validateField('email', value);
 *
 *   // Before submit:
 *   if (!validate(allValues)) return;
 *
 * What it validates:
 *   - name: required, min 2 chars
 *   - email: required, valid email format
 *   - phone: required, Vietnamese phone or international format (7-15 digits)
 *   - company: optional
 *   - message: optional, max 1000 chars
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/;

export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    label: 'Họ và tên',
    labelEn: 'Full name',
  },
  email: {
    required: true,
    pattern: EMAIL_RE,
    label: 'Email',
    labelEn: 'Email',
  },
  phone: {
    required: true,
    pattern: PHONE_RE,
    label: 'Số điện thoại',
    labelEn: 'Phone number',
  },
  company: {
    required: false,
    maxLength: 200,
    label: 'Công ty',
    labelEn: 'Company',
  },
  message: {
    required: false,
    maxLength: 1000,
    label: 'Lời nhắn',
    labelEn: 'Message',
  },
};

export const validateFieldValue = (name, value, lang = 'vi') => {
  const rule = VALIDATION_RULES[name];
  if (!rule) return null;

  const str = typeof value === 'string' ? value.trim() : '';
  const label = lang === 'en' ? (rule.labelEn || rule.label) : rule.label;

  if (rule.required && !str) {
    return lang === 'en' ? `${label} is required` : `${label} không được để trống`;
  }
  if (rule.minLength && str.length < rule.minLength) {
    return lang === 'en'
      ? `${label} must be at least ${rule.minLength} characters`
      : `${label} phải có ít nhất ${rule.minLength} ký tự`;
  }
  if (rule.maxLength && str.length > rule.maxLength) {
    return lang === 'en'
      ? `${label} must be no more than ${rule.maxLength} characters`
      : `${label} không được vượt quá ${rule.maxLength} ký tự`;
  }
  if (rule.pattern && str && !rule.pattern.test(str)) {
    return lang === 'en'
      ? `Please enter a valid ${label.toLowerCase()}`
      : `${label} không hợp lệ`;
  }
  return null;
};

export const useQuoteFormValidation = () => {
  const [errors, setErrors] = useState({});

  /**
   * Validate a single field and update its error state.
   * Returns the error string (or null if valid).
   */
  const validateField = useCallback((name, value, lang = 'vi') => {
    const error = validateFieldValue(name, value, lang);
    setErrors((prev) => {
      if (!error) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: error };
    });
    return error;
  }, []);

  /**
   * Validate all fields at once. Returns true if the form is valid.
   * Useful to call before submission.
   */
  const validate = useCallback((values, lang = 'vi') => {
    const newErrors = {};
    let valid = true;
    for (const name of Object.keys(VALIDATION_RULES)) {
      const error = validateFieldValue(name, values[name], lang);
      if (error) {
        newErrors[name] = error;
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const isValid = Object.keys(errors).length === 0;

  return { errors, validateField, validate, clearErrors, isValid };
};

export default useQuoteFormValidation;
