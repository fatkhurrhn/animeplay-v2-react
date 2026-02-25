export default function DonateSection() {
    return (
        <div className="flex flex-col gap-1 px-3">
            <h2 className="ml-1 text-base font-semibold pt-2 mb-2 text-white">
                Dukung Kami
            </h2>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm text-white/60 leading-relaxed">
                    Bantu perkembangkan aplikasi ini dengan berdonasi melalui link berikut di{" "}
                    <a
                        href="https://trakteer.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white transition"
                    >
                        Trakteer.id
                    </a>
                </p>
            </div>
        </div>
    );
}