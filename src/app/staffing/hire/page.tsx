import { 
  getSupervisoryOrgs, 
  getLocations, 
  getCostCenters,
  getCompanies,
  getJobProfiles, 
  getOpenPositions 
} from '@/actions'
import { HireEmployeeForm } from './hire-form'

/**
 * Hire Employee Page - Server Component
 * 
 * Loads all dropdown data server-side for performance,
 * then renders the client form component.
 */

export default async function HireEmployeePage() {
  // Fetch all dropdown data in parallel
  const [
    supervisoryOrgs,
    locations,
    costCenters,
    companies,
    jobProfiles,
    openPositions,
  ] = await Promise.all([
    getSupervisoryOrgs(),
    getLocations(),
    getCostCenters(),
    getCompanies(),
    getJobProfiles(),
    getOpenPositions(),
  ])

  return (
    <HireEmployeeForm 
      supervisoryOrgs={supervisoryOrgs}
      locations={locations}
      costCenters={costCenters}
      companies={companies}
      jobProfiles={jobProfiles}
      openPositions={openPositions}
    />
  )
}
