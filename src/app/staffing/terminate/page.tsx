import { connection } from 'next/server'
import { getActiveWorkers } from '@/actions'
import { TerminateEmployeeForm } from './terminate-form'

/**
 * Terminate Employee Page - Server Component
 * 
 * Loads active workers for selection,
 * then renders the client form component.
 */

export default async function TerminateEmployeePage() {
  await connection()
  const workers = await getActiveWorkers()

  return <TerminateEmployeeForm workers={workers} />
}
