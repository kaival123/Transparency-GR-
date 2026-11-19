/**
 * Marathi labels for the mock backend's data (the real API returns localised labels per Accept-Language).
 * English text is the key; words in names are translated individually.
 */
const MR_TEXT: Record<string, string> = {
  // Departments
  'Social Justice & Special Assistance Department': 'सामाजिक न्याय व विशेष सहाय्य विभाग',
  'Agriculture Department': 'कृषी विभाग',
  'Tribal Development Department': 'आदिवासी विकास विभाग',
  // Schemes
  'Indira Gandhi National Disability Pension Scheme': 'इंदिरा गांधी राष्ट्रीय दिव्यांग निवृत्तीवेतन योजना',
  'Indira Gandhi National Widow Pension Scheme': 'इंदिरा गांधी राष्ट्रीय विधवा निवृत्तीवेतन योजना',
  'Indira Gandhi Old Age Pension Scheme': 'इंदिरा गांधी राष्ट्रीय वृद्धापकाळ निवृत्तीवेतन योजना',
  Khauti: 'खावटी',
  'Agri DBT': 'कृषी डीबीटी',
  // Benefit types & genders
  'Pension (DBT)': 'निवृत्तीवेतन (डीबीटी)',
  'Cash Transfer': 'रोख हस्तांतरण',
  'Input Subsidy': 'निविष्ठा अनुदान',
  Female: 'स्त्री',
  Male: 'पुरुष',
  Transgender: 'तृतीयपंथी',
  // Districts
  Nashik: 'नाशिक', Pune: 'पुणे', Nandurbar: 'नंदुरबार', Palghar: 'पालघर',
  // Talukas
  Igatpuri: 'इगतपुरी', Sinnar: 'सिन्नर', Niphad: 'निफाड', Haveli: 'हवेली', Maval: 'मावळ', Junnar: 'जुन्नर',
  Navapur: 'नवापूर', Shahada: 'शहादा', Dahanu: 'डहाणू', Jawhar: 'जव्हार', Wada: 'वाडा',
  // Villages
  Ghoti: 'घोटी', Wadivarhe: 'वाडीवऱ्हे', Khambale: 'खंबाळे', Dodi: 'दोडी', 'Nandur Shingote': 'नांदूर शिंगोटे',
  Vavi: 'वावी', Lasalgaon: 'लासलगाव', Ozar: 'ओझर', Pimpalgaon: 'पिंपळगाव', 'Uruli Kanchan': 'उरुळी कांचन',
  'Loni Kalbhor': 'लोणी काळभोर', Wagholi: 'वाघोली', Kamshet: 'कामशेत', Vadgaon: 'वडगाव', Talegaon: 'तळेगाव',
  Narayangaon: 'नारायणगाव', Otur: 'ओतूर', Ale: 'आळे', Visarwadi: 'विसरवाडी', Chinchpada: 'चिंचपाडा',
  Khandbara: 'खांडबारा', Mhasawad: 'म्हसावद', Prakasha: 'प्रकाशा', Sarangkheda: 'सारंगखेडा', Kasa: 'कासा',
  Chinchani: 'चिंचणी', Vangaon: 'वानगाव', Sakharshet: 'साखरशेत', Dhanoshi: 'धानोशी', Kasatwadi: 'कासटवाडी',
  Kudus: 'कुडूस', Gorhe: 'गोऱ्हे', Khanivali: 'खानिवली',
  // Name parts
  Sunita: 'सुनीता', Meena: 'मीना', Kavita: 'कविता', Asha: 'आशा', Lata: 'लता', Savita: 'सविता', Rekha: 'रेखा',
  Shobha: 'शोभा', Anita: 'अनिता', Vandana: 'वंदना', Ramesh: 'रमेश', Suresh: 'सुरेश', Ganesh: 'गणेश', Vijay: 'विजय',
  Prakash: 'प्रकाश', Sanjay: 'संजय', Dilip: 'दिलीप', Anil: 'अनिल', Raju: 'राजू', Mahesh: 'महेश', Patil: 'पाटील',
  Pawar: 'पवार', Jadhav: 'जाधव', Shinde: 'शिंदे', Gavit: 'गावित', Valvi: 'वळवी', More: 'मोरे', Kale: 'काळे',
  Bhoir: 'भोईर', Thakare: 'ठाकरे'
};

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export type MockLang = 'en' | 'mr';

export const langFrom = (header: string | null): MockLang => (header?.toLowerCase().startsWith('mr') ? 'mr' : 'en');

export function localize(text: string, lang: MockLang): string {
  if (lang === 'en') return text;
  return MR_TEXT[text] ?? text.split(' ').map((w) => MR_TEXT[w] ?? w).join(' ');
}

export function fyLabel(fy: string, lang: MockLang): string {
  return lang === 'mr' ? `आर्थिक वर्ष ${fy.replace(/\d/g, (d) => DEVANAGARI_DIGITS[+d])}` : `FY ${fy}`;
}
