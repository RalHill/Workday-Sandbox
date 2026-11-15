import { connection } from 'next/server'
import { 
  getSupervisoryOrgs, 
  getLocations, 
  getCostCenters,
  getCompanies,
  getJobProfiles,
} from '@/actions'
import { CreatePositionForm } from './create-position-form'

/**
 * Create Position Page - Server Component
 * 
 * Loads all dropdown data server-side for performance,
 * then renders the client form component.
 */

export default async function CreatePositionPage() {
  await connection()
  // Fetch all dropdown data in parallel
  const [
    supervisoryOrgs,
    locations,
    costCenters,
    companies,
    jobProfiles,
  ] = await Promise.all([
    getSupervisoryOrgs(),
    getLocations(),
    getCostCenters(),
    getCompanies(),
    getJobProfiles(),
  ])

  return (
    <CreatePositionForm 
      supervisoryOrgs={supervisoryOrgs}
      locations={locations}
      costCenters={costCenters}
      companies={companies}
      jobProfiles={jobProfiles}
    />
  )
}
