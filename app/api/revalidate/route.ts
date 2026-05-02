import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string; slug?: { current: string } }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    if (!body?._type) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    // Revalidate by tag based on document type
    revalidateTag(body._type, { expire: 0 });

    // If it's a page, we might want to revalidate the 'page' tag as well
    if (body._type === 'page') {
      revalidateTag('page', { expire: 0 });
      if (body.slug?.current) {
        revalidateTag(body.slug.current, { expire: 0 });
      }
    }

    console.log(`Revalidated: ${body._type} ${body.slug?.current || ''}`);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}
