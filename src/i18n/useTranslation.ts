import { useSessionStore } from '../state/useSessionStore';
import { i18n, t as translate } from './index';

export function useTranslation() {
  const language = useSessionStore((s) => s.language) ?? 'en';
  i18n.locale = language;
  return { t: translate, language };
}
