import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')

  // Enable Draft Mode in Next.js 16
  const draft = await draftMode()
  draft.enable()

  if (slug) {
    redirect(`/${slug}`)
  }

  redirect('/')
}
