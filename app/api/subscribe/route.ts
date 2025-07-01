import { NextRequest, NextResponse } from 'next/server'

interface SubscribeRequestBody {
  email: string
  firstName: string
}

interface SubscribeResponseData {
  message: string
  success: boolean
  error?: string // Optional error message
}

/**
 * Handles POST requests for newsletter subscriptions to the Beehiiv API.
 * This API route acts as a proxy to protect your Beehiiv API key.
 *
 * @param req The NextRequest object containing the request details.
 * @returns A NextResponse object with the subscription status.
 */
export async function POST(req: NextRequest) {

  const { email, firstName } = (await req.json()) as SubscribeRequestBody

  if (!email || !firstName) {
    return NextResponse.json(
      { success: false, message: 'Email and First Name are required.' },
      { status: 400 }
    )
  }

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY

  const BEEHIIV_PUBLICATION_ID = process.env.NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error('Missing Beehiiv API Key or Publication ID environment variables.')
    return NextResponse.json(
      { success: false, message: 'Server configuration error.' },
      { status: 500 }
    )
  }

  const beehiivApiUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`

  try {
    const beehiivResponse = await fetch(beehiivApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        first_name: firstName,
      }),
    })

    const data = await beehiivResponse.json()

    if (beehiivResponse.ok) {
      return NextResponse.json(
        { success: true, message: 'Subscription successful!' },
        { status: 200 }
      )
    } else {
      // If Beehiiv returned an error (e.g., 400, 401, 404, 409)
      console.error('Beehiiv API Error:', data)
      // Return a more specific error message from Beehiiv if available
      const errorMessage = data.message || data.error || 'Failed to subscribe due to an external service error.'
      return NextResponse.json(
        { success: false, message: errorMessage, error: errorMessage },
        { status: beehiivResponse.status }
      )
    }
  } catch (error) {
    // Handle network errors or other unexpected issues
    console.error('Error subscribing to Beehiiv:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error.', error: (error as Error).message },
      { status: 500 }
    )
  }
}
