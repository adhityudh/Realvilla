import { NextResponse, userAgent } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  try {
    // Capture telemetry data
    const ua = userAgent(request);
    const browser = `${ua.browser.name || ''} ${ua.browser.version || ''}`.trim() || 'Unknown Browser';
    const os = `${ua.os.name || ''} ${ua.os.version || ''}`.trim() || 'Unknown OS';
    
    let deviceType = 'Desktop/PC';
    if (ua.device.type) {
      deviceType = ua.device.type.charAt(0).toUpperCase() + ua.device.type.slice(1);
    }
    const device = `${ua.device.vendor || ''} ${ua.device.model || ''}`.trim() || deviceType;
    
    const country = request.headers.get('x-vercel-ip-country') || '';
    const city = request.headers.get('x-vercel-ip-city') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    const submissionTime = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/Madrid',
      dateStyle: 'full',
      timeStyle: 'short'
    }) + ' (Madrid)';

    const body = await request.json();
    const {
      propertyId,
      propertyTitle,
      propertyPrice,
      depositAmount = 500,
      locale = 'en',
      pageUrl,
      personal,
      offer,
    } = body;

    // Basic validation
    if (!propertyId || !propertyTitle) {
      return NextResponse.json({ error: 'Missing property information.' }, { status: 400 });
    }

    if (!personal?.fullName || !personal?.email || !personal?.idNumber || !personal?.phone || !personal?.address) {
      return NextResponse.json({ error: 'Missing personal details.' }, { status: 400 });
    }

    if (!offer?.offerPrice || offer.offerPrice < 1) {
      return NextResponse.json({ error: 'Invalid offer price.' }, { status: 400 });
    }

    // Build success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://realvilla.es';
    const successUrl = `${baseUrl}/${locale}/offer-success?session_id={CHECKOUT_SESSION_ID}&property=${encodeURIComponent(propertyId)}&locale=${locale}`;
    const cancelUrl = pageUrl || `${baseUrl}/${locale}/properties`;

    // Format property price for display
    const formattedPropertyPrice = propertyPrice
      ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(propertyPrice)
      : 'Price upon request';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: depositAmount * 100, // Stripe uses cents
            product_data: {
              name: locale === 'es'
                ? `Depósito de Propuesta — ${propertyTitle}`
                : `Proposal Deposit — ${propertyTitle}`,
              description: locale === 'es'
                ? `Depósito no reembolsable de €${depositAmount} para garantizar su propuesta de compra. Precio de la propiedad: ${formattedPropertyPrice}`
                : `Non-refundable deposit of €${depositAmount} to secure your purchase proposal. Property price: ${formattedPropertyPrice}`,
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      customer_email: personal.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Store all form data in metadata for webhook processing
      metadata: {
        propertyId,
        propertyTitle: propertyTitle.substring(0, 500), // Stripe metadata limit
        propertyPrice: propertyPrice?.toString() || '',
        depositAmount: depositAmount.toString(),
        locale,
        pageUrl: (pageUrl || '').substring(0, 500),
        // Personal
        fullName: personal.fullName,
        idNumber: personal.idNumber,
        email: personal.email,
        phone: personal.phone,
        address: personal.address.substring(0, 500),
        // Offer
        offerPrice: offer.offerPrice.toString(),
        additionalConditions: (offer.additionalConditions || '').substring(0, 500),
        // Timestamps
        submittedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        // Telemetry
        device: device.substring(0, 500),
        os: os.substring(0, 500),
        browser: browser.substring(0, 500),
        country: country.substring(0, 100),
        city: city.substring(0, 100),
        ip: ip.substring(0, 100),
        submissionTime: submissionTime.substring(0, 500),
      },
      locale: locale === 'es' ? 'es' : 'en',
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error('[Offer/CreateCheckout] Error:', err);

    if (err.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Payment system configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
