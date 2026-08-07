import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import publicApi from '../api/publicApi';

const QuoteForm = ({ postTitle, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const [form, setForm] = useState({ name: '', phone: '', email: '', product: postTitle || '', message: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { setError(isVi ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in required fields'); return; }
    setSaving(true);
    setError('');
    try {
      await publicApi.submitQuote(form);
      setDone(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(isVi ? 'Gửi yêu cầu thất bại' : 'Failed to submit');
    } finally { setSaving(false); }
  };

  if (done) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <div className="text-3xl mb-2">&#10003;</div>
      <h3 className="font-semibold text-green-700 mb-1">{isVi ? 'Gửi thành công!' : 'Submitted successfully!'}</h3>
      <p className="text-sm text-green-600">{isVi ? 'Yêu cầu đã được gửi tới đội ngũ. Chúng tôi sẽ xem xét và phản hồi cho bạn.' : 'Your request has been sent to our team. We will review and get back to you.'}</p>
    </div>
  );

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-lg text-gray-800 mb-1">{isVi ? 'Yeu cau bao gia' : 'Request a Quote'}</h3>
      <p className="text-sm text-gray-500 mb-4">{isVi ? 'Dien thong tin de chung toi lien he ban.' : 'Fill in your info and we will contact you.'}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
            className="input-field text-sm" placeholder={isVi ? 'Ho va ten *' : 'Full name *'} required />
        </div>
        <div>
          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
            className="input-field text-sm" placeholder={isVi ? 'So dien thoai *' : 'Phone *'} required />
        </div>
        <div>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
            className="input-field text-sm" placeholder={isVi ? 'Email *' : 'Email *'} required />
        </div>
        <div>
          <input type="text" value={form.product} onChange={(e) => set('product', e.target.value)}
            className="input-field text-sm" placeholder={isVi ? 'San pham quan tam' : 'Interested product'} />
        </div>
        <div>
          <textarea value={form.message} onChange={(e) => set('message', e.target.value)}
            className="input-field text-sm resize-none" rows={3} placeholder={isVi ? 'Noi dung' : 'Message'} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
          {saving ? (isVi ? 'Dang gui...' : 'Sending...') : (isVi ? 'Gui yeu cau' : 'Submit Request')}
        </button>
      </form>
    </div>
  );
};

export default QuoteForm;
