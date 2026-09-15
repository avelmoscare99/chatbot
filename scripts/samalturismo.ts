const SITE_BASE = 'https://turismo.samalcity.gov.ph'
const USER_AGENT = 'SamalTourismChatbot/1.0 (Academic thesis project; non-commercial data collection)'

export type OperatorType =
  | 'beach_resorts'
  | 'inland_resorts'
  | 'mabuhay_accommodations'
  | 'tour_operators'
  | 'tour_guides'
  | 'dive_shops'
  | 'dine_and_drinks'
  | 'tourist_attractions'

export const OPERATOR_TYPES: OperatorType[] = [
  'beach_resorts',
  'inland_resorts',
  'mabuhay_accommodations',
  'tour_operators',
  'tour_guides',
  'dive_shops',
  'dine_and_drinks',
  'tourist_attractions'
]

export const OPERATOR_PAGE_SLUG: Record<OperatorType, string> = {
  beach_resorts: 'beach_resorts',
  inland_resorts: 'inland_resorts',
  mabuhay_accommodations: 'mabuhay_accommodations',
  tour_operators: 'tour_operators',
  tour_guides: 'tourist_guides',
  dive_shops: 'dive_shops',
  dine_and_drinks: 'dine_and_drinks',
  tourist_attractions: 'tourist_attractions'
}

const DISTRICT_LABELS: Record<string, string> = {
  babak: 'Babak',
  samal: 'Samal',
  kaputian: 'Kaputian'
}

export interface RawOperator {
  id: number
  company_name?: string
  name?: string
  is_island_hopping?: boolean
  boat_required?: boolean
  resort_capacity?: number | null
  resort_overnight_capacity?: number | null
  has_dot_accreditation?: boolean
  is_active?: boolean
  social_media?: Record<string, string> | unknown[]
  contact_numbers?: string[]
  barangay?: { id: number; name: string }
}

export interface Operator extends RawOperator {
  operatorType: OperatorType
  district: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchOperators(operatorType: OperatorType): Promise<Operator[]> {
  const url = `${SITE_BASE}/api/operators?operator=${operatorType}`
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`Failed to fetch operator=${operatorType}: ${response.status}`)
  }
  const body = (await response.json()) as Record<string, RawOperator[]>

  const out: Operator[] = []
  for (const [districtKey, records] of Object.entries(body)) {
    const district = DISTRICT_LABELS[districtKey] ?? districtKey
    for (const record of records) {
      out.push({ ...record, operatorType, district })
    }
  }
  return out
}

export async function fetchAllOperators(): Promise<Operator[]> {
  const all: Operator[] = []
  for (const operatorType of OPERATOR_TYPES) {
    const batch = await fetchOperators(operatorType)
    all.push(...batch)
    await sleep(150)
  }
  return all
}

export function operatorName(op: Operator): string {
  return op.company_name || op.name || 'Unnamed listing'
}

function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function operatorLocation(op: Operator): string {
  const barangay = op.barangay?.name ? titleCase(op.barangay.name) : undefined
  const parts = [barangay, op.district, 'Island Garden City of Samal'].filter(
    (part): part is string => !!part
  )
  return parts.join(', ')
}

export function splitContacts(op: Operator): { phones: string[]; emails: string[] } {
  const contacts = op.contact_numbers ?? []
  const emails = contacts.filter((c) => c.includes('@'))
  const phones = contacts.filter((c) => !c.includes('@'))
  return { phones, emails }
}

export function operatorWebsite(op: Operator): string {
  const social = op.social_media
  if (!social || Array.isArray(social)) return ''
  const record = social as Record<string, string>
  return record.facebook || record.website || record.web || Object.values(record)[0] || ''
}
