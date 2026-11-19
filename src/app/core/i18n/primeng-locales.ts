import { Translation } from 'primeng/api';
import { Lang } from './languages';

/** Strings rendered inside PrimeNG components (empty lists, paginator and dialog aria labels, …). */
export const PRIMENG_TRANSLATIONS: Record<Lang, Translation> = {
  en: {
    accept: 'Yes',
    reject: 'No',
    clear: 'Clear',
    apply: 'Apply',
    cancel: 'Cancel',
    emptyMessage: 'No results found',
    emptyFilterMessage: 'No results found',
    emptySearchMessage: 'No results found',
    emptySelectionMessage: 'No selected item',
    searchMessage: '{0} results are available',
    selectionMessage: '{0} items selected',
    aria: {
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
      navigation: 'Navigation',
      selectAll: 'All items selected',
      unselectAll: 'All items unselected',
      pageLabel: 'Page {page}',
      firstPageLabel: 'First page',
      lastPageLabel: 'Last page',
      nextPageLabel: 'Next page',
      prevPageLabel: 'Previous page',
      previousPageLabel: 'Previous page',
      rowsPerPageLabel: 'Rows per page',
      jumpToPageDropdownLabel: 'Jump to page',
      removeLabel: 'Remove'
    }
  },
  mr: {
    accept: 'होय',
    reject: 'नाही',
    clear: 'काढा',
    apply: 'लागू करा',
    cancel: 'रद्द करा',
    emptyMessage: 'कोणतेही निकाल आढळले नाहीत',
    emptyFilterMessage: 'कोणतेही निकाल आढळले नाहीत',
    emptySearchMessage: 'कोणतेही निकाल आढळले नाहीत',
    emptySelectionMessage: 'काहीही निवडलेले नाही',
    searchMessage: '{0} निकाल उपलब्ध आहेत',
    selectionMessage: '{0} निवडले',
    aria: {
      close: 'बंद करा',
      previous: 'मागील',
      next: 'पुढील',
      navigation: 'नेव्हिगेशन',
      selectAll: 'सर्व निवडले',
      unselectAll: 'सर्व निवड काढली',
      pageLabel: 'पृष्ठ {page}',
      firstPageLabel: 'पहिले पृष्ठ',
      lastPageLabel: 'शेवटचे पृष्ठ',
      nextPageLabel: 'पुढील पृष्ठ',
      prevPageLabel: 'मागील पृष्ठ',
      previousPageLabel: 'मागील पृष्ठ',
      rowsPerPageLabel: 'प्रति पृष्ठ ओळी',
      jumpToPageDropdownLabel: 'पृष्ठावर जा',
      removeLabel: 'काढा'
    }
  }
};
