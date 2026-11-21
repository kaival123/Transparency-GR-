import { TranslationKey } from './en';

/** मराठी UI strings. Typed against EN, so a missing or extra key fails the build. */
export const MR: Record<TranslationKey, string> = {
  // App shell
  'app.name': 'पारदर्शकता पोर्टल',
  'app.title': 'महाराष्ट्र शासन',
  'nav.main': 'मुख्य नेव्हिगेशन',
  'nav.open': 'नेव्हिगेशन उघडा',
  'nav.close': 'नेव्हिगेशन बंद करा',
  'nav.home': 'मुख्यपृष्ठ',
  'nav.breadcrumb': 'पृष्ठमार्ग',
  'nav.dashboard': 'डॅशबोर्ड',
  'nav.dashboard.desc': 'महत्त्वाची आकडेवारी एका दृष्टिक्षेपात',
  'nav.directory': 'योजना निर्देशिका',
  'nav.directory.desc': 'सर्व योजना व विभाग',
  'nav.beneficiaries': 'लाभार्थी',
  'nav.beneficiaries.desc': 'लाभार्थी याद्या शोधा',
  'a11y.skipMain': 'मुख्य मजकुराकडे जा',
  'a11y.bar': 'सुलभता पर्याय',
  'a11y.textSize': 'मजकुराचा आकार',
  'a11y.textSmaller': 'मजकूर लहान करा',
  'a11y.textReset': 'मजकुराचा मूळ आकार',
  'a11y.textLarger': 'मजकूर मोठा करा',
  'gov.emblem': 'भारताचे राजचिन्ह',
  'theme.label': 'थीम',
  'theme.colour': 'रंग थीम',
  'theme.orange': 'केशरी',
  'theme.blue': 'निळा',
  'theme.teal': 'हिरवट निळा',
  'theme.magenta': 'किरमिजी',
  'theme.black': 'काळा',
  'lang.label': 'भाषा',
  'lang.changed': 'भाषा बदलली',
  'lang.changedDetail': 'पोर्टल आता मराठीत दाखवले जात आहे.',
  'footer.disclosure':
    'लाभार्थ्यांचा तपशील केवळ संबंधित माहितीधारक विभागाने मंजुरी दिल्यासच प्रसिद्ध केला जातो. संवेदनशील ओळख माहिती (आधार, बँक, मोबाइल, पत्ता, जन्मतारीख) कधीही दाखवली जात नाही.',

  // Filters
  'filters.title': 'फिल्टर',
  'filters.activeCount': '{count} फिल्टर सक्रिय',
  'filters.reset': 'रीसेट',
  'filter.fy': 'आर्थिक वर्ष',
  'filter.dept': 'विभाग',
  'filter.scheme': 'योजना',
  'filter.district': 'जिल्हा',
  'filter.taluka': 'तालुका',
  'filter.village': 'गाव',
  'filter.name': 'लाभार्थ्याचे नाव',
  'filter.benefitType': 'लाभाचा प्रकार',
  'filter.gender': 'लिंग',
  'filters.all': 'सर्व',
  'filters.all.dept': 'सर्व विभाग',
  'filters.all.benefitType': 'लाभाचे सर्व प्रकार',
  'filters.all.gender': 'सर्व लिंग',
  'filters.selectedCount': '{0} निवडले',
  'filters.searchName': 'नावाने शोधा',
  'filters.minChars': 'किमान {n} अक्षरे',
  'filters.enterMinChars': 'किमान {n} अक्षरे टाइप करा',
  'filters.confirmHeader': 'सर्व फिल्टर काढायचे?',
  'filters.confirmMessage': 'यामुळे सर्व पृष्ठांवरील निवडलेले सर्व फिल्टर काढले जातील.',
  'filters.confirmAccept': 'फिल्टर काढा',
  'filters.cleared': 'फिल्टर काढले',
  'common.cancel': 'रद्द करा',

  // Data table
  'table.default': 'माहिती तक्ता',
  'table.quickSearch': 'झटपट शोध',
  'table.quickSearchAria': 'तक्त्यात झटपट शोधा',
  'table.columns': 'स्तंभ',
  'table.columnsCount': 'स्तंभ ({0})',
  'table.chooseColumns': 'दिसणारे स्तंभ निवडा',
  'table.masked': 'प्रकटीकरण धोरणानुसार लपवलेले',
  'table.pageReport': '{totalRecords} पैकी {first}–{last}',

  // States
  'state.empty': 'माहिती आढळली नाही',
  'state.emptyHint': 'फिल्टर बदलून किंवा काढून पुन्हा प्रयत्न करा.',
  'state.noRecords': 'कोणत्याही नोंदी आढळल्या नाहीत',
  'state.noDataForFilters': 'या फिल्टरसाठी माहिती नाही',
  'state.errorTitle': 'काहीतरी चूक झाली',
  'state.errorMessage': 'ही माहिती लोड करता आली नाही. कृपया पुन्हा प्रयत्न करा.',
  'state.retry': 'पुन्हा प्रयत्न करा',
  'api.errorSummary': 'माहिती लोड झाली नाही',
  'api.unreachable': 'सर्व्हरशी संपर्क होत नाही. आपले इंटरनेट कनेक्शन तपासा.',
  'api.failed': 'विनंती अयशस्वी झाली ({status}).',

  // Status values
  'status.Active': 'सक्रिय',
  'status.Closed': 'बंद',
  'status.Upcoming': 'आगामी',

  // Dashboard
  'dashboard.keyFigures': 'महत्त्वाची आकडेवारी',
  'dashboard.byScheme': 'योजनानिहाय',
  'dashboard.byDistrict': 'जिल्हानिहाय',
  'dashboard.byGender': 'लिंगनिहाय',
  'kpi.totalBeneficiaries': 'एकूण लाभार्थी',
  'kpi.disbursed': 'वितरित लाभ',
  'kpi.schemes': 'लाभार्थी असलेल्या योजना',
  'kpi.districts': 'समाविष्ट जिल्हे',
  'kpi.beneficiaries': 'लाभार्थी',
  'chart.total': 'लाभार्थी',

  // Columns
  'col.scheme': 'योजना',
  'col.department': 'विभाग',
  'col.benefitType': 'लाभाचा प्रकार',
  'col.beneficiaries': 'लाभार्थी',
  'col.amount': 'वितरित रक्कम',
  'col.status': 'स्थिती',
  'col.name': 'लाभार्थ्याचे नाव',
  'col.id': 'अर्ज क्रमांक',
  'col.benefitAmount': 'लाभाची रक्कम',
  'col.period': 'अंतिम अद्यतन दिनांक',

  // Directory
  'directory.rowAction': 'या योजनेचे लाभार्थी पाहा',

  // Export
  'export.download': 'डाउनलोड करा',
  'export.excel': 'एक्सेल (CSV)',
  'export.pdf': 'पीडीएफ',
  'export.excelAria': 'एक्सेलमध्ये (CSV) निर्यात करा',
  'export.pdfAria': 'पीडीएफमध्ये निर्यात करा',
  'export.ready': 'निर्यात तयार',
  'export.downloaded': '{file} डाउनलोड झाली.',
  'export.popupBlocked': 'पॉप-अप अडवले',
  'export.allowPopups': 'पीडीएफ निर्यातीसाठी पॉप-अपला परवानगी द्या.',


  // Beneficiaries
  'benef.aria': 'लाभार्थी यादी',
  'benef.emptyTitle': 'कोणतेही लाभार्थी आढळले नाहीत',
  'benef.emptyMessage': 'वेगळे नाव (किमान ३ अक्षरे) वापरून पाहा किंवा ठिकाणाचे फिल्टर कमी करा.',
  'benef.notDisclosed': 'प्रकट केलेले नाही'
};
