import type { Company } from '@/types/company'
import { CUR_PRESETS } from './currencyPresets'
import { uid } from './uid'

export function defCompany(name?: string): Company {
  const now = Date.now()
  return {
    id: uid(),
    name: name || 'My Company',
    nameAr: '',
    sub: '',
    subAr: '',
    tel: '', fax: '', mob: '',
    cr: '', pobox: '', loc: '',
    email: '', website: '',
    logo: '', seal: '', signature: '',
    pcolor: '#D97706',
    acolor: '#78716C',
    currency: { ...CUR_PRESETS.OMR },
    vatReg: '', vatPct: 0,
    bankName: '', bankAccName: '', bankAcc: '', bankIban: '', bankSwift: '', bankBranch: '',
    invPref: 'INV-', invNext: 1, recPref: 'RV-', recNext: 1, quotPref: 'QT-', quotNext: 1,
    invNotes: '', invTerms: '', invFooter: '', recBeing: '',
    invTemplate: 'classic', recTemplate: 'classic', quotTemplate: 'classic', watermark: '',
    showArabic: false,
    createdAt: now, updatedAt: now,
  }
}
