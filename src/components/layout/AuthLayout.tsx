interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 bg-app-page pt-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-md bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white font-extrabold text-4xl shadow-lg shadow-[#00D6A3]/20 mb-1.5">
          Q
        </div>
        <span className="font-extrabold text-text-primary tracking-tight text-lg leading-none block">QuickSend</span>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
