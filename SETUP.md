# RealVilla Project Setup Guide

This guide provides complete setup instructions for the RealVilla Next.js application with Sanity CMS integration.

## Prerequisites

- Node.js 20.x or higher
- npm (comes with Node.js)
- Git (for version control)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```bash
# Sanity CMS Configuration (REQUIRED)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=your_sanity_write_token
SANITY_API_READ_TOKEN=your_sanity_read_token

# Site Configuration (REQUIRED)
NEXT_PUBLIC_BASE_URL=https://realvilla.es
NEXT_PUBLIC_SITE_URL=https://realvilla.es

# Google Maps API (REQUIRED)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Payment Integration (REQUIRED)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Service (REQUIRED)
RESEND_API_KEY=your_resend_api_key
CONTACT_RECIPIENT_EMAIL=contact@realvilla.es

# GeoNames API (REQUIRED)
GEONAMES_USERNAME=your_geonames_username
```

### Optional Variables

```bash
# Sanity Configuration (Optional - has defaults)
NEXT_PUBLIC_SANITY_API_VERSION=2024-05-02
NEXT_PUBLIC_SANITY_STEGA=false

# Revalidation (Optional)
SANITY_REVALIDATE_SECRET=your_revalidate_secret
```

## Setup Script

Run the following commands in order:

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 16.2.4
- React 19.2.4
- Sanity CMS
- Stripe integration
- Email service (Resend)
- GSAP animations
- TypeScript and all dev dependencies

### 2. Verify Environment Variables

Ensure your `.env.local` file is properly configured with all required variables listed above.

### 3. Build the Project (Optional - for production)

```bash
npm run build
```

This compiles the TypeScript code and creates an optimized production build.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
realvilla/
├── app/                    # Next.js App Router
│   ├── (site)/            # Main site pages
│   ├── (studio)/          # Sanity Studio
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components
│   ├── sections/         # Page sections
│   └── layout/           # Layout components
├── sanity/               # Sanity CMS configuration
│   ├── schemaTypes/      # Content schemas
│   └── lib/              # Sanity utilities
├── lib/                  # Utility functions
├── dictionaries/         # i18n translations (en, es)
├── public/               # Static assets
└── scripts/              # Database seeding scripts
```

## Key Features

- **Multi-language Support**: English and Spanish (en, es)
- **Sanity CMS**: Headless CMS for content management
- **Stripe Integration**: Payment processing for property offers
- **Email Service**: Contact forms and notifications via Resend
- **Google Maps**: Property location and search
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Meta tags, sitemaps, robots.txt

## Sanity Studio

Access the Sanity Studio at: `http://localhost:3000/studio`

You'll need to authenticate with your Sanity account.

## API Endpoints

- `/api/contact` - Contact form submission
- `/api/offer/create-checkout` - Create Stripe checkout session
- `/api/offer/webhook` - Stripe webhook handler
- `/api/offer/generate-pdf` - Generate offer PDF
- `/api/places/*` - Google Places API proxy
- `/api/revalidate` - On-demand revalidation

## Database Seeding

The project includes numerous seeding scripts in the `scripts/` directory:

```bash
# Example: Seed properties
node scripts/seed-properties.mjs

# Example: Seed homepage content
node scripts/seed-homepage-contact.mjs
```

Review individual scripts for specific seeding operations.

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Error: "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
   - Solution: Ensure all required variables are set in `.env.local`

2. **Sanity Connection Issues**
   - Verify your Sanity project ID and dataset name
   - Check that API tokens have correct permissions

3. **Stripe Webhook Errors**
   - Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:3000/api/offer/webhook`

4. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

## Development Workflow

1. Start development server: `npm run dev`
2. Make changes to code
3. Test in browser at `http://localhost:3000`
4. Run linter: `npm run lint`
5. Build for production: `npm run build`
6. Test production build: `npm start`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Resend Documentation](https://resend.com/docs)

## Support

For issues or questions, refer to the project documentation or contact the development team.