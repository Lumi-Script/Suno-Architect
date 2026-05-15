interface FooterProps {
  git: string;
}

const Footer = ({ git }: FooterProps) => {
  return (
    <footer className="w-full py-6 text-center border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <p className="text-slate-500 text-sm">
        Open Source Project. View source on{' '}
        <a 
          href={git} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-purple-400 hover:text-purple-300 hover:underline transition-colors font-medium"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
};

export default Footer;