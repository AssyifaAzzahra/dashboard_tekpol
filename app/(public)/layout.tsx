export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <video autoPlay muted loop className="h-full w-full object-cover">
          <source src="/images/videoni.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </div>
      {children}
    </div>
  );
}
