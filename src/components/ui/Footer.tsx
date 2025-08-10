import { Facebook, Instagram, Send } from "lucide-react"; // Send icon looks like Telegram
import clsx from "clsx";
import MainLogo from "../shared/MainLogo";
import { Link } from "react-router-dom";
import { scrollToTop } from "../../utils/shared/scrollBehaviour";

interface Props {
  darkMode: boolean;
}

export default function Footer({ darkMode }: Props) {
  return (
    <footer
      className={clsx(
        "w-full px-6 py-6 mt-10 bg-gray-900 text-gray-400",
        darkMode
          ? "shadow-[0_-2px_4px_rgba(255,255,255,0.1)]"
          : "shadow-[0_-2px_4px_rgba(0,0,0,0.1)]"
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
        {/* Logo + Intro */}
        <div className="flex flex-col items-start text-left max-w-md">
          <Link
            to="/"
            className="w-32 mb-3"
            onClick={() => {
              scrollToTop();
            }}
          >
            {/* Force white text in light mode by overriding titleColor */}
            <MainLogo
              titleColor="text-white"
              subtitleColor="text-red-600"
              center={false} // removes center alignment → no indent
            />
          </Link>

          <p className="text-sm leading-relaxed">
            OnsideNews-ը ֆուտբոլային լուրեր, վերլուծություններ և հոդվածներ
            տրամադրող հարթակ է, որտեղ կարող եք գտնել ամենաթարմ ֆուտբոլային
            նորությունները։
          </p>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-start gap-3">
          <span className="font-semibold">Մեր հետ կապվել</span>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "p-2 rounded-full transition-colors duration-300",
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-200 hover:bg-gray-300"
              )}
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "p-2 rounded-full transition-colors duration-300",
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-200 hover:bg-gray-300"
              )}
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "p-2 rounded-full transition-colors duration-300",
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-200 hover:bg-gray-300"
              )}
            >
              <Send size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-6 border-t border-gray-400 dark:border-gray-600 pt-4 text-center text-xs">
        © {new Date().getFullYear()} Բոլոր իրավունքները պաշտպանված են
      </div>
    </footer>
  );
}
