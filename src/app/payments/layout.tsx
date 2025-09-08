import Layout from '../../components/Layout';

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
