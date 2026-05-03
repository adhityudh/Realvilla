import SmoothScroller from '@/components/SmoothScroller';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroller>
      {children}
    </SmoothScroller>
  );
}
