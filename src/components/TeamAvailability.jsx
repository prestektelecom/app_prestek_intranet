// Fotos dos membros da equipe disponíveis
const teamMembers = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBaPvCdZv_g_lQUo-xLq4u3u1G_jQRVKyJ8VhVVzNvbpcJOJL9Z6GPnxycxIvcuGhuhJ3gvMH2v9ZQXluRgryCJlFlPn_3VF22zZmO_CBQG2AvzK3e3EPIt1NIKECpP963-lAGHS4fxHQbF-g2iV2FujvZPTf6GiFAJhxjtwYsSBwpJQ9EojNo06PH9MZ8GB0rhleEYdtvMW9xm2iVgh587x6wC6U_5884_588a_czli5Dwl0Rv3TkcxpL6INgBG65h4eDGbWFdENs',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_ej9Q2Q8UZ-DcH7DkE2aRpZiQ7xEVO3LLJoPfm7NVz4tBB0B3HivKvjHg7mtBUmM3Jc8DEqKjL5vWVBaQFd0LqVF7jYYmrkO_Y6DZfFuRrFSGkZ4hoytluhsapJlbxdz9lcXCQJAlxjGJhEtGdfLKPvjsqL_L35WVvfOV3h8wvKc60w3lnkQGBCygXyHgWafyoEQF9BoBA9Q_YXI2uPnAsOrMIUtDVPCww3vsRCk0aBctK4qMVd_ZW6XC7h17ovqLRWPGhw7B-Iw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC4KmfyZ1CoAmFBCAQFdIm4yPnFFpDTzGALIdgJFhrPriYQBUgpMR85E9g4ljdH0Lw1LJxKEWS6hGcWITVR3lxsIsbG6agcsvgMs0jFZo3A3RWCUXAgTeUL4rzrsXs3YuOlGb-7dNLL_PQpBcXdP2VtV_i9is6poSZ_kpBpXUb0Qq73ED057xDhNnQF3iDBxlr7UVcn6_ya1_jYmNUdNzI6ocM4Ty-0mlqv4DfjQp4uwBcrD4xsGpClJHJy4OZIqlFQv46QzEDd1cs',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDomNrBy2ylRTZpIjHrERpkRJ8jezcTUBx8-YpL-0Qin4Jn2T-_OVjKswI60-eTjycrK6mfBUEMswrxqhvpzzITbAz0VlBhDt2ybb9WqrCtehpo6gKWJD-Tnx_adOQwC3RH6kbfz_WQhVR_1c7pXpQKUVNSNAMCrMCtpxENIqpydgOKswtltMETjUqUgq9N2xylqQ_ebPJDZw4d64w0sPhVxBGef_rEOqLrA5TdrDJk3ODpTONebQYHXkronfJXmue6j5xHQaCbe3A',
]

// Widget de disponibilidade da equipe com fotos empilhadas
export default function TeamAvailability() {
    return (
        <div className="mt-6 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Disponibilidade da Equipe</h3>
                <span className="material-symbols-outlined text-gray-400 text-sm">more_horiz</span>
            </div>

            {/* Fotos empilhadas */}
            <div className="flex -space-x-2 overflow-hidden mb-3">
                {teamMembers.map((src, idx) => (
                    <img
                        key={idx}
                        alt="Membro da equipe"
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                        src={src}
                    />
                ))}
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs font-bold text-gray-500">
                    +4
                </div>
            </div>

            {/* Status online */}
            <div className="flex items-center gap-2 text-xs text-[#635c55] dark:text-gray-300">
                <span className="size-2 rounded-full bg-green-500"></span>
                8 Online agora
            </div>
        </div>
    )
}
