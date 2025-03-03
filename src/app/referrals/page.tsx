import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ReferralCard } from "@/components/referral-card"

export default async function ReferralsPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <ReferralCard userId={session.user.id} />
    </div>
  )
}

