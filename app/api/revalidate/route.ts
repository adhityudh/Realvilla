import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string; slug?: { current: string }; propertyCode?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      console.error('Revalidation error: Invalid signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    if (!body?._type) {
      console.error('Revalidation error: Missing body type');
      return new NextResponse('Bad Request', { status: 400 });
    }

    // 1. Revalidate by specific document type
    revalidateTag(body._type, { expire: 0 });

    // 2. If it's a 'page' document, revalidate the 'page' tag and its specific slug
    if (body._type === 'page') {
      revalidateTag('page', { expire: 0 });
      if (body.slug?.current) {
        revalidateTag(body.slug.current, { expire: 0 });
      }
    }

    // 3. If it's a property, revalidate by propertyCode and also the 'page' tag
    if (body._type === 'property') {
      revalidateTag('page', { expire: 0 });
      if (body.propertyCode) {
        revalidateTag(body.propertyCode, { expire: 0 });
      }
    }

    const identifier = body._type === 'property' ? body.propertyCode : body.slug?.current;
    console.log(`[Webhook] Revalidated: ${body._type} ${identifier || ''}`);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (err: any) {
    console.error('Revalidation Error:', err);
    return new NextResponse(err.message, { status: 500 });
  }
}
