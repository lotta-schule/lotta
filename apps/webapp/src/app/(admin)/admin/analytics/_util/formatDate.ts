import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const formatDate = (date: Date) =>
  format(date, 'yyyy-MM-dd', { locale: de });
