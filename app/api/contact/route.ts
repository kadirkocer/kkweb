import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema using Zod
const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be less than 254 characters')
    .toLowerCase()
    .trim(),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .trim(),
})

// Rate limiting storage (in production, use Redis or a database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(ip: string): string {
  return `rate_limit:${ip}`
}

function isRateLimited(ip: string): boolean {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Maximum 5 requests per 15 minutes

  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    // Create new or reset expired record
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return false
  }

  if (record.count >= maxRequests) {
    return true
  }

  // Increment count
  record.count++
  rateLimitMap.set(key, record)
  return false
}

function getClientIp(request: NextRequest): string {
  // Try to get IP from various headers (for different hosting providers)
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-client-ip') ||
    '127.0.0.1'
  )
}

async function sendEmail(data: z.infer<typeof contactSchema>): Promise<boolean> {
  // In a real application, you would integrate with an email service like:
  // - Resend
  // - SendGrid
  // - Nodemailer with SMTP
  // - AWS SES
  
  try {
    // Example with console logging for development
    console.log('📧 New contact form submission:', {
      name: data.name,
      email: data.email,
      message: data.message,
      timestamp: new Date().toISOString(),
    })

    // For demonstration, we'll simulate an email being sent
    // Replace this with actual email service integration
    
    // Example Resend integration (commented out):
    /*
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'website@kadir.dev',
      to: 'hello@kadir.dev',
      subject: `New contact form message from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from kadir.dev contact form</small></p>
      `,
    })
    */

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request)

    // Check rate limiting
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Validate the data using Zod schema
    const validationResult = contactSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
        { status: 400 }
      )
    }

    const { name, email, message } = validationResult.data

    // Additional security checks
    if (message.includes('http://') || message.includes('https://')) {
      // Basic spam prevention - reject messages with URLs
      return NextResponse.json(
        {
          success: false,
          error: 'Messages containing URLs are not allowed',
          code: 'SPAM_DETECTED'
        },
        { status: 400 }
      )
    }

    // Send the email
    const emailSent = await sendEmail({ name, email, message })

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send message. Please try again later.',
          code: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been received and logged.',
        delivery: 'stub'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON format',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      )
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
}