import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ManageClient from './ManageClient'

export default async function ManagePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <ManageClient session={session} />
}
