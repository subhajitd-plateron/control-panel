import Layout from '../../components/Layout';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
