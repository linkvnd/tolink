export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-slate-500 text-sm z-10 relative bg-white/50 backdrop-blur-sm border-t border-slate-200">
      <p>© {new Date().getFullYear()} by GIA BẢO K24 TM3. All rights reserved.</p>
      <div className="mt-2 space-x-4">
        <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
      </div>
    </footer>
  );
}
