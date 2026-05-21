export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-linear-to-br from-purple-200 to-blue-400/50 px-4">
      {children}
    </div>
  );
}
