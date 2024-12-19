import { redirect } from 'next/navigation'

export const metadata = {}

export default function IndexPage() {
  redirect('/docs')
}
