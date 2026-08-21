import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiList } from 'react-icons/fi';

const pickValue = (spec, lang) => {
  if (lang === 'en') {
    return (spec.valueEn && spec.valueEn.trim()) || spec.value || '';
  }
  return spec.value || '';
};

const formatValue = (spec, lang) => {
  const raw = pickValue(spec, lang);
  if (!raw && !spec.unit) return '';
  if (raw && spec.unit) return `${raw} ${spec.unit}`;
  return raw || spec.unit || '';
};

const SpecificationsTable = ({ specs = [], lang = 'vi' }) => {
  const rows = useMemo(() => {
    return (specs || [])
      .filter((s) => s && typeof s.key === 'string' && s.key.trim())
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [specs]);

  if (rows.length === 0) return null;

  const heading = lang === 'en' ? 'Specifications' : 'Thông số kỹ thuật';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <FiList size={12} className="text-primary" />
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {heading}
        </h4>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50/40">
        <table className="w-full text-xs">
          <tbody className="md:table-row-group">
            {rows.map((spec, idx) => {
              const display = formatValue(spec, lang);
              return (
                <tr
                  key={spec._id || `${spec.key}-${idx}`}
                  className={
                    idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-gray-50/60'
                  }
                >
                  <th
                    scope="row"
                    className="text-left align-top font-medium text-slate-600 py-2 px-3 border-b border-gray-100 last:border-b-0 w-1/2 md:w-2/5"
                  >
                    {spec.key}
                  </th>
                  <td className="align-top text-slate-800 font-semibold py-2 px-3 border-b border-gray-100 last:border-b-0 break-words">
                    {display || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SpecificationsTable;