export function Footer() {
    return (
        <footer className="w-full py-8 mt-auto">
            <div className="max-w-2xl mx-auto px-6">
                {/* Simple footer - links are already in homepage like brianyu.me */}
                <div className="border-t border-zinc-200 pt-6">
                    <p className="text-sm text-zinc-500">
                        © {new Date().getFullYear()} anttxqt
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
