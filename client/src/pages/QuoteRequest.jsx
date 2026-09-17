import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiTrash2, FiX, FiSend, FiAlertCircle, FiMail, FiPhone, FiBox, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useQuoteBag } from '../context/QuoteBagContext';
import { useToast } from '../context/ToastContext';
import publicApi from '../api/publicApi';
import { SUPPORTED_LOCALES } from '../i18n';
import placeholderProduct from '../assets/placeholder-product.svg';
import { getLocalizedField } from '../utils/i18nField';
import { useFormAutosave } from '../hooks/useFormAutosave';
import { useQuoteFormValidation, validateFieldValue } from '../hooks/useQuoteFormValidation';
import { perfMark } from '../utils/perf';

/* ─── Step definitions ───────────────────────────────────────────────────── */
const STEPS = (t) => [
  { id: 1, label: t('quote.stepContact') || 'Liên hệ', sublabel: t('quote.stepContactSub') || 'Thông tin của bạn' },
  { id: 2, label: t('quote.stepReview') || 'Sản phẩm', sublabel: t('quote.stepReviewSub') || 'Xem lại sản phẩm' },
  { id: 3, label: t('quote.stepConfirm') || 'Xác nhận', sublabel: t('quote.stepConfirmSub') || 'Gửi yêu cầu' },
];

const AUTOSAVE_KEY = 'quote-request-v1';

/* ─── Step 1: Contact form ─────────────────────────────────────────────────── */
const ContactStep = ({ values, errors, onChange, onFieldBlur, lang }) => {
  const { t } = useTranslation();
  const firstErrorRef = useRef(null);

  // Focus first error field on mount if there are errors.
  useEffect(() => {
    const firstKey = Object.keys(errors)[0];
    if (firstKey && firstErrorRef.current) {
      firstErrorRef.current.focus();
    }
  }, [errors]);

  const fieldClass = (name) =>
    `input-field w-full text-sm transition-colors ${
      errors[name]
        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200'
        : 'focus:border-primary focus:ring-primary/20'
    }`;

  return (
    <div className="space-y-3">
      {/* Name */}
      <div>
        <label htmlFor="q-name" className="block text-xs font-medium text-gray-700 mb-1">
          {t('quote.fullName')} *
        </label>
        <input
          ref={Object.keys(errors)[0] === 'name' ? firstErrorRef : undefined}
          id="q-name"
          type="text"
          name="name"
          value={values.name}
          onChange={onChange}
          onBlur={onFieldBlur}
          autoComplete="name"
          aria-describedby={errors.name ? 'q-name-error' : undefined}
          aria-invalid={!!errors.name}
          className={fieldClass('name')}
          placeholder={t('auth.fullNamePlaceholder') || 'Nguyễn Văn A'}
        />
        {errors.name && (
          <p id="q-name-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle size={11} /> {errors.name}
          </p>
        )}
      </div>

      {/* Email + Phone row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="q-email" className="block text-xs font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            ref={Object.keys(errors)[0] === 'email' ? firstErrorRef : undefined}
            id="q-email"
            type="email"
            name="email"
            value={values.email}
            onChange={onChange}
            onBlur={onFieldBlur}
            autoComplete="email"
            inputMode="email"
            aria-describedby={errors.email ? 'q-email-error' : undefined}
            aria-invalid={!!errors.email}
            className={fieldClass('email')}
            placeholder="email@company.com"
          />
          {errors.email && (
            <p id="q-email-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <FiAlertCircle size={11} /> {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="q-phone" className="block text-xs font-medium text-gray-700 mb-1">
            {t('quote.phone')} *
          </label>
          <input
            ref={Object.keys(errors)[0] === 'phone' ? firstErrorRef : undefined}
            id="q-phone"
            type="tel"
            name="phone"
            value={values.phone}
            onChange={onChange}
            onBlur={onFieldBlur}
            autoComplete="tel"
            inputMode="tel"
            aria-describedby={errors.phone ? 'q-phone-error' : undefined}
            aria-invalid={!!errors.phone}
            className={fieldClass('phone')}
            placeholder="0912 345 678"
          />
          {errors.phone && (
            <p id="q-phone-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <FiAlertCircle size={11} /> {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Company */}
      <div>
        <label htmlFor="q-company" className="block text-xs font-medium text-gray-700 mb-1">
          {t('quote.company')}
        </label>
        <input
          id="q-company"
          type="text"
          name="company"
          value={values.company}
          onChange={onChange}
          onBlur={onFieldBlur}
          autoComplete="organization"
          className={fieldClass('company')}
          placeholder={t('quote.companyPlaceholder') || 'Tên công ty (không bắt buộc)'}
        />
        {errors.company && (
          <p role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle size={11} /> {errors.company}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="q-message" className="block text-xs font-medium text-gray-700 mb-1">
          {t('quote.message')}
          <span className="text-gray-400 font-normal ml-1">
            ({values.message.length}/1000)
          </span>
        </label>
        <textarea
          id="q-message"
          name="message"
          value={values.message}
          onChange={onChange}
          onBlur={onFieldBlur}
          rows={4}
          aria-describedby={errors.message ? 'q-message-error' : undefined}
          aria-invalid={!!errors.message}
          className={`${fieldClass('message')} resize-none`}
          placeholder={t('quote.messagePlaceholder') || 'Mô tả chi tiết yêu cầu của bạn...'}
        />
        {errors.message && (
          <p id="q-message-error" role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle size={11} /> {errors.message}
          </p>
        )}
      </div>

      {/* Preferred contact */}
      <div>
        <p className="block text-xs font-medium text-gray-700 mb-2">
          {t('quote.preferredContact')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {['email', 'phone'].map((method) => (
            <label
              key={method}
              className={`flex items-center gap-2 text-xs cursor-pointer border rounded-lg p-2.5 transition-colors ${
                values.preferredContact === method
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <input
                type="radio"
                name="preferredContact"
                value={method}
                checked={values.preferredContact === method}
                onChange={onChange}
                className="accent-primary"
              />
              {method === 'email' ? (
                <>
                  <FiMail size={14} className={values.preferredContact === method ? 'text-blue-600' : 'text-gray-400'} />
                  <span>{t('quote.preferredEmail') || 'Email'}</span>
                </>
              ) : (
                <>
                  <FiPhone size={14} className={values.preferredContact === method ? 'text-primary' : 'text-gray-400'} />
                  <span>{t('quote.preferredPhone') || 'Điện thoại'}</span>
                </>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Step 2: Product review ─────────────────────────────────────────────────── */
const ReviewStep = ({ items, count, onRemove, onClear, onBrowse, marketContext, lang }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {count === 0 && !marketContext ? (
        <div className="text-center py-10">
          <FiBox size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-500 mb-4">{t('quote.bagEmpty')}</p>
          <button onClick={onBrowse} className="btn-primary text-sm">
            {t('quote.browseProducts')}
          </button>
        </div>
      ) : (
        <>
          {marketContext && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800">
                <FiBox size={14} />
                <span>Yêu cầu cho: <strong>{marketContext.name}</strong></span>
              </div>
              <button onClick={() => {}} className="text-amber-600 hover:text-amber-800">
                <FiX size={12} />
              </button>
            </div>
          )}

          <div className="text-xs text-gray-500 mb-2">
            {count > 0 ? `${count} sản phẩm đã chọn` : 'Chưa chọn sản phẩm cụ thể'}
          </div>

          {count > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 border border-gray-100 rounded-lg p-2">
                  <img
                    src={item.imageUrl || placeholderProduct}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded bg-gray-50 flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = placeholderProduct; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    {item.softeningPoint && (
                      <p className="text-[10px] text-gray-400">{item.softeningPoint}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item._id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {count > 0 && (
              <button type="button" onClick={onClear} className="text-xs text-red-500 hover:underline">
                {t('quote.clear')}
              </button>
            )}
            <Link to={`/${lang}/products`} className="text-xs text-primary hover:underline ml-auto">
              + Thêm sản phẩm
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Step 3: Confirm & submit ─────────────────────────────────────────────── */
const ConfirmStep = ({ values, items, count, marketContext, sending, onSubmit, lang }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-24 flex-shrink-0">{t('quote.fullName')}:</span>
          <span className="font-medium text-gray-900">{values.name}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-24 flex-shrink-0">Email:</span>
          <span>{values.email}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-24 flex-shrink-0">{t('quote.phone')}:</span>
          <span>{values.phone}</span>
        </div>
        {values.company && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-24 flex-shrink-0">{t('quote.company')}:</span>
            <span>{values.company}</span>
          </div>
        )}
        {values.message && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-24 flex-shrink-0">{t('quote.message')}:</span>
            <span className="text-gray-600 text-xs">{values.message}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-24 flex-shrink-0">Liên hệ qua:</span>
          <span className="capitalize">{values.preferredContact === 'email' ? 'Email' : 'Điện thoại'}</span>
        </div>
        {marketContext && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-24 flex-shrink-0">Thị trường:</span>
            <span>{marketContext.name}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-24 flex-shrink-0">Sản phẩm:</span>
          <span>{count > 0 ? `${count} sản phẩm` : 'Chưa chọn sản phẩm'}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={sending}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {sending ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('quoteSection.form.sending') || 'Đang gửi...'}
          </>
        ) : (
          <>
            <FiSend size={16} />
            {t('quoteSection.form.submit') || 'Gửi yêu cầu báo giá'}
          </>
        )}
      </button>
    </div>
  );
};

/* ─── Step indicator ──────────────────────────────────────────────────────── */
const StepIndicator = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-center gap-0 mb-6" role="list" aria-label="Form progress">
    {steps.map((step, idx) => {
      const done = step.id < currentStep;
      const active = step.id === currentStep;
      return (
        <div key={step.id} className="flex items-center" role="listitem">
          <button
            type="button"
            onClick={() => done && onStepClick(step.id)}
            disabled={!done}
            aria-current={active ? 'step' : undefined}
            className={`flex flex-col items-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${
              done ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                done
                  ? 'bg-green-500 text-white'
                  : active
                  ? 'bg-primary text-white ring-4 ring-primary/20'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {done ? <FiCheck size={13} /> : step.id}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-primary' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </button>
          {idx < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 mx-1 ${step.id < currentStep ? 'bg-green-400' : 'bg-gray-100'}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ─── Main QuoteRequest page ─────────────────────────────────────────────────── */
const QuoteRequest = () => {
  const { t, i18n } = useTranslation();
  const lang = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'vi';
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const steps = STEPS(t);

  const { items, count, removeFromQuoteBag, clearQuoteBag } = useQuoteBag();
  const { getSaved, save, clear } = useFormAutosave(AUTOSAVE_KEY);
  const { errors, validateField, validate, clearErrors } = useQuoteFormValidation();

  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedContact, setSubmittedContact] = useState(null);
  const [marketContext, setMarketContext] = useState(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [savedValues, setSavedValues] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', message: '', preferredContact: 'email',
  });

  // Check for autosaved data on mount.
  useEffect(() => {
    const saved = getSaved();
    if (saved) {
      setSavedValues(saved);
      setShowResumeBanner(true);
    }
  }, []);

  // Restore autosaved data if user confirms.
  const handleResume = () => {
    if (savedValues) {
      setFormData(savedValues);
      clearErrors();
    }
    setShowResumeBanner(false);
  };

  // Dismiss autosave banner and keep fresh form.
  const handleDismissResume = () => {
    setShowResumeBanner(false);
    setSavedValues(null);
    clear();
  };

  // Prefill market context.
  useEffect(() => {
    const marketId = searchParams.get('market');
    if (!marketId) return;
    let cancelled = false;
    publicApi.getMarketTree(marketId, lang).then((r) => {
      if (cancelled) return;
      const data = r?.data?.data;
      if (!data) return;
      const name = getLocalizedField(data, lang, 'title', 'titleEn');
      setMarketContext({ id: data._id, name });
      setFormData((prev) =>
        prev.message
          ? prev
          : {
              ...prev,
              message: `Tôi quan tâm đến các sản phẩm cho thị trường "${name}". Vui lòng tư vấn.`,
            }
      );
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [searchParams, lang]);

  // Autosave whenever form data changes.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      save(next);
      return next;
    });
    // Clear error on edit.
    if (errors[name]) {
      validateField(name, value, lang);
    }
  };

  // Validate on blur for immediate feedback.
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value, lang);
  };

  // Step navigation.
  const canProceedFromStep1 = () => {
    const step1Fields = { name: formData.name, email: formData.email, phone: formData.phone, company: formData.company, message: formData.message };
    return validate(step1Fields, lang);
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }
    if (step === 2 && currentStep === 1) {
      if (!canProceedFromStep1()) return;
      clearErrors();
      setCurrentStep(2);
      return;
    }
    if (step === 3) {
      if (currentStep === 1) {
        if (!canProceedFromStep1()) return;
        clearErrors();
      }
      if (count === 0 && !marketContext) {
        toast.error(t('quote.bagEmpty'));
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (count === 0 && !marketContext) {
      setSubmitError(t('quote.bagEmpty'));
      return;
    }
    setSubmitError('');
    setSending(true);
    perfMark('quote-submit', 'start');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        message: formData.message.trim(),
        preferredContact: formData.preferredContact,
        market: marketContext?.name || '',
        items: items.map((it) => ({
          productId: it._id || it.id || '',
          name: it.name || '',
          softeningPoint: it.softeningPoint || '',
          imageUrl: it.imageUrl || '',
          quantity: Number(it.quantity) || 1,
        })),
      };
      await publicApi.submitQuote(payload);
      clear(); // remove autosave on success
      setSubmittedContact({ name: formData.name, email: formData.email, phone: formData.phone, preferredContact: formData.preferredContact });
      setSubmitted(true);
      clearQuoteBag();
    } catch (err) {
      setSubmitError(err.response?.data?.message || t('quoteSection.error') || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setSending(false);
      perfMark('quote-submit', 'end');
    }
  };

  const handleSendAnother = () => {
    setSubmitted(false);
    setSubmittedContact(null);
    setFormData({ name: '', email: '', phone: '', company: '', message: '', preferredContact: 'email' });
    setCurrentStep(1);
    clear();
  };

  useEffect(() => { document.title = t('quote.title'); }, [t]);

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <FiCheckCircle size={72} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('quote.success')}</h2>
          {submittedContact && (
            <p className="text-sm text-gray-600 mb-1">
              {t('quote.successDetail', { channel: submittedContact.preferredContact === 'email' ? 'email' : t('quote.phone') })}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Link to={`/${lang}/products`} className="btn-secondary text-sm">{t('quote.browseProducts')}</Link>
            <button onClick={handleSendAnother} className="btn-primary text-sm">{t('quote.sendAnother')}</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pb-8">
      <SEO title={t('quote.title')} description={t('quote.subtitle')} url={`/${lang}/quote`} noindex />

      {/* Page header */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-lg font-semibold">{t('quote.title')}</h1>
          <p className="text-xs text-white/70">{t('quote.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Resume banner */}
        <AnimatePresence>
          {showResumeBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm"
            >
              <p className="text-blue-800">
                Chúng tôi đã lưu bản nháp từ lần trước. Khôi phục thông tin?
              </p>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button onClick={handleResume} className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90">
                  Khôi phục
                </button>
                <button onClick={handleDismissResume} className="text-xs px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100">
                  Bỏ qua
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={goToStep} />

        {/* Market context tag */}
        {marketContext && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-1.5 text-xs mb-4">
            <FiBox size={12} />
            <span>Thị trường: <strong>{marketContext.name}</strong></span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Step header */}
          <div className="px-5 pt-5 pb-3 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              {steps[currentStep - 1]?.label}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{steps[currentStep - 1]?.sublabel}</p>
          </div>

          {/* Step content */}
          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {currentStep === 1 && (
                  <ContactStep
                    values={formData}
                    errors={errors}
                    onChange={handleChange}
                    onFieldBlur={handleFieldBlur}
                    lang={lang}
                  />
                )}
                {currentStep === 2 && (
                  <ReviewStep
                    items={items}
                    count={count}
                    onRemove={removeFromQuoteBag}
                    onClear={clearQuoteBag}
                    onBrowse={() => {}}
                    marketContext={marketContext}
                    lang={lang}
                  />
                )}
                {currentStep === 3 && (
                  <ConfirmStep
                    values={formData}
                    items={items}
                    count={count}
                    marketContext={marketContext}
                    sending={sending}
                    onSubmit={handleSubmit}
                    lang={lang}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="mx-5 mb-4 flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg p-3">
              <FiAlertCircle size={14} />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="px-5 pb-5 flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft size={14} />
                Quay lại
              </button>
            )}
            {currentStep < 3 && (
              <button
                type="button"
                onClick={() => goToStep(currentStep + 1)}
                className="btn-primary flex-1 flex items-center justify-center gap-1.5"
              >
                Tiếp tục
                <FiArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* No products warning */}
        {count === 0 && !marketContext && (
          <p className="text-xs text-center text-gray-400 mt-3">
            Bạn chưa chọn sản phẩm nào. Có thể gửi yêu cầu với chỉ thông tin liên hệ.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default QuoteRequest;
