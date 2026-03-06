import React from 'react';

export default function Schedule() {
    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
                <a className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" href="#">
                    <span className="material-symbols-outlined text-lg">home</span>
                    Início
                </a>
                <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                <a className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors" href="#">Processos Internos</a>
                <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                <span className="text-[#1d150c] dark:text-white text-sm font-bold">Escala de Plantão</span>
            </div>

            {/* Header da Página */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#eaddcd] dark:border-gray-800 pb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#1d150c] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Escala de Plantão</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-lg font-medium max-w-2xl">Visualize e gerencie as atribuições de cobertura mensal para a equipe de suporte.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-[#1d150c] dark:text-white font-bold shadow-sm hover:bg-[#fcfaf8] dark:bg-[#2c2217] hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                        Imprimir
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">
                        <span className="material-symbols-outlined text-[20px]">ios_share</span>
                        Exportar para iCal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Coluna Esquerda: Calendário e Filtros */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Seletor de Período */}
                    <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                        <h3 className="text-lg font-bold text-[#1d150c] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            Selecionar Período
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">MÊS</span>
                                <div className="relative">
                                    <select className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all">
                                        <option>Janeiro</option>
                                        <option defaultValue>Fevereiro</option>
                                        <option>Março</option>
                                        <option>Abril</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
                                </div>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">ANO</span>
                                <div className="relative">
                                    <select className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all">
                                        <option>2024</option>
                                        <option defaultValue>2025</option>
                                        <option>2026</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Mini Calendário */}
                    <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <button className="p-1 rounded-full hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <p className="text-[#1d150c] dark:text-white text-base font-bold">Fevereiro 2025</p>
                            <button className="p-1 rounded-full hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                                <div key={day} className="text-xs font-black text-[#a17745] dark:text-orange-300 uppercase tracking-widest">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                            <div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div>
                            <CalendarDay day="1" />
                            <CalendarDay day="2" />
                            <CalendarDay day="3" />
                            <CalendarDay day="4" />
                            <CalendarDay day="5" isToday active />
                            <CalendarDay day="6" />
                            <CalendarDay day="7" />
                            <CalendarDay day="8" active />
                            <CalendarDay day="9" active />
                            <CalendarDay day="10" />
                            <CalendarDay day="11" />
                            <CalendarDay day="12" />
                            <CalendarDay day="13" />
                            <CalendarDay day="14" />
                            <CalendarDay day="15" active />
                            <CalendarDay day="16" active />
                            <CalendarDay day="17" />
                            <CalendarDay day="18" />
                            <CalendarDay day="19" />
                            <CalendarDay day="20" />
                            <CalendarDay day="21" />
                            <CalendarDay day="22" active />
                            <CalendarDay day="23" active />
                            <CalendarDay day="24" />
                            <CalendarDay day="25" />
                            <CalendarDay day="26" />
                            <CalendarDay day="27" />
                            <CalendarDay day="28" />
                        </div>

                        <div className="mt-6 flex items-center gap-5 text-xs font-bold justify-center border-t border-[#f4eee6] pt-4">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary shadow-sm shadow-primary/20"></div>
                                <span className="text-[#1d150c] dark:text-white">Dia Atual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-[#10b981] shadow-sm shadow-[#10b981]/20"></div>
                                <span className="text-[#1d150c] dark:text-white">Plantão</span>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="bg-[#fcfaf8] dark:bg-[#2c2217] p-6 rounded-xl border border-[#eaddcd] dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white dark:bg-[#1a130b] rounded-lg shadow-sm text-primary border border-[#eaddcd] dark:border-gray-800">
                                <span className="material-symbols-outlined text-[24px]">analytics</span>
                            </div>
                            <div>
                                <p className="text-[#a17745] dark:text-orange-300 text-xs font-black uppercase tracking-wider mb-1">Total de Plantões</p>
                                <p className="text-3xl font-black text-[#1d150c] dark:text-white">24</p>
                                <p className="text-sm font-medium text-[#a17745] dark:text-orange-300 mt-1">Atribuições na equipe este mês</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Tabela de Escala Detalhada */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-[#1a130b] rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800 overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-5 border-b border-[#eaddcd] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-[#fcfaf8] dark:bg-[#2c2217]">
                            <h3 className="text-lg font-bold text-[#1d150c] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">table_chart</span>
                                Escala Detalhada de Suporte
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 text-[#a17745] dark:text-orange-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
                                    <span className="material-symbols-outlined">filter_list</span>
                                </button>
                                <button className="p-2 text-[#a17745] dark:text-orange-300 hover:text-[#1d150c] dark:text-white hover:bg-white dark:bg-[#1a130b] rounded-lg transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800">
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-white dark:bg-[#1a130b] border-b-2 border-[#f4eee6] text-[#a17745] dark:text-orange-300">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-28">Data</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-36">Dia da Semana</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Suporte N1</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Suporte N2</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Gerente ON</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4eee6]">
                                    <ScheduleRow
                                        date="Fev 05"
                                        day="Quarta-feira"
                                        isToday
                                        n1={{ name: 'Sarah J.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0wk2s-79jSJo51ZLHL4K97Fmj4Ds_PEKuKUBg1crymxYwjmwFVEhX3EjXD1x6xa9YHeucXnBgqcCZjym0yAWzoFJYX5qcOU1ipbTuA59Oi9CYKsh2g23e7sjBIHYGeJs8Os0uDGxujbXH0CUaGbASmr9I_UhciDvXjyRr1V_MqeniMO5rRQpW1fs2S2StjRTHqX64YhIwZYtxbyAQq3akVTL0jFQ6-9Eus7gLFi1-qdmvP3i9AFMKcWsKR78qiXCWEpNVxJKOey4' }}
                                        n2={{ name: 'Michael C.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7btibQUBBlATKg8cJ4aDVbc-VniWGjs4hTqORPrTw3oNyARhxWtXc_f49judxZa-Ogj5pSQqDcipz0zoqdQagaA0O48zcNfpzgC3N0fyS3mR7uTrfmWCy6gngEdxdM0RUBczORyJJ_FkvPbiy-IESTEcOl3qkNimrt3CVjZ-Pz3Vduqgvt58l6SDoS4W8cyJl5e73i_QmUyPL24QOa6QXbCs81e126rEUhQREgEH4JWfTLCLccKYhFZ1CrqIvYcJjZpx6wXQbvT8' }}
                                        mgr={{ name: 'David S.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYvqKfJXYcmVga0AlLbSOWZvMv8VQ1s323Kfgbe1mRk-JeHi5Ut4l8i1NHHYFYYcQLnHSkyLqLvaglWvheVfQsaPQSUcLKZCF6i5H2_CuuUVlStpN73wvdd90ZRqvQtZMtii4YRpnK3_QL1l9WsTS6-Gr9JbhFTHk3rpG8M5l2e1KN699hMCa7eQpJidadVi9BfoOz6LiBYdd-a7grJktNMPuRNuLKGwv4yr1u7cok4zgJw9IlY2RMetbHICNkIgyDiMvR849y4ME' }}
                                    />
                                    <ScheduleRow
                                        date="Fev 08"
                                        day="Sábado"
                                        isWeekend
                                        n1={{ name: 'Emily D.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtpb4x4hztktTzF6bw8w_LXUme0aZFoujb0ntlC0qrRJMwc2_T-QEpHLLZju_AF-v_-WO50FmM-AoZsuwzYBZi_xPM-aaidnVvN6Rby2kOZCAiubWCPqKpvPiTRqN3MJO3_iQdQkoOc8QEeYIUjXLetwQc4T72PmS0_tr2iTV5i36_Mn19jWKPGJqLGAW5JA_CfktnfKILdRZ27g2wuOcuHwWerEiTGh7P-pQ3H8jUjTmCIGlFKMIJasQGkRyRxxamLSDG58vqgQs' }}
                                        n2={null}
                                        mgr={{ name: 'Lisa W.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGGHC5Bc5IxUzcIMHZc94dVDgmzJ8IsCI8ciKyFCL36wcn8xSALwnoppULUN0R4eSbIXYW45vct3SyZr1aX66T6QlrtsAFAfOg9J-J0iomn50Q__CvjPBXAc5jBRmfkrFOFD8k6NgcmXfDEHDJEyBpk4VCM0wxUe7LlyxosRHKVj48CP5c1z9bNwn12OPn833Lf8IpcheRWn7KuRxihOBKVsGSJxbo5SozsgToLjeMJ_mRE1PQMqaSCAr-RfBuMUlWKBYW7nm78N4' }}
                                    />
                                    <ScheduleRow
                                        date="Fev 09"
                                        day="Domingo"
                                        isWeekend
                                        n1={{ name: 'James W.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfZIfGNX8EipPbL4biJeQger9fIYX4Xv0GbJ6Cxkl-f89x6sPPe8liyCu5ImuOLbJv5SvXNbo5d_SbfBKO3iPomKnFs6W8614eT2JFHpRpPdOnuqOQIlYPBk9YckxWgMdydECRePnHTvDWIb0o26YTlWkNK7hLWudFI5vcsu9AYygUXfCKHVT5wMcoWER5mlWpWNwOwHF8LNBhDwpccrC-eFwot9dib0xvWedXLQGtziPc1puzWzpf5Ju-x2zv_dzXWE3sYzVhUJQ' }}
                                        n2={{ name: 'Robert B.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8nZxwbuzsV2Ow2cC9gHVPNbUSGmleeHYxpCR5WQygfi7vRcCv9TrIugkjaQNOGZE9wg1_vKuqXnPD5zSdK6bB3iuIzFtLOBEPQZXSdEnfKkDWI0S9_u2wsbT03h3zsUpX24TOjjY24IdG0WayD8qSL3cPU1h0djFN4A9P_6FjVkJLzlJjcNxTXOE9TsKE9cNioBIBb7rDfkrpJCDmm-F7jp5KcV9GzVid4RXk1X0SuR_27xlTqpc_GElNDQIihwjYdQ8hAce4uQ' }}
                                        mgr={{ name: 'Patricia M.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1Vitr0pQ5PrYSGuurCLiSd1pXO4mP2J3ANQrwQnjSb_nUVE9utevGHdc88Fw3qPCON9vYEsZf8Aywd6B82PpGh0OhhvgGGIxGRjT7w58S8tjD6xhxcaBtIr4lSs7S65QU6043FVyK_4rFoFNpfA2cPCN3YNTUvnqn-M2twrhqtfoWltUrDPNlwzlpi9BQJQnrkLHLU1tiQi8UaSyGWU1bdEGTBKDO--5sfpa1ss3G7WGo11gK1NTFJUbGR-TzOJnBoey1aLf6KQg' }}
                                    />
                                    <ScheduleRow
                                        date="Fev 15"
                                        day="Sábado"
                                        isWeekend
                                        n1={{ name: 'John D.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgWpq2Gm8WOWGX58RoPucf1kDG8eEPoDyw5jZxeHtNCQSqfCKroo22WLzkXPfrGBnZirQFsMR36OI9qWC1YinsglMS9eg7HBD7kbuJ3gAJJIWviW_5O4zwrCs6mlRp2JFjwt5N8n0__URWSyWd_EThg5dhH9jDoPpLbcoPXS1kq0HtbAtWwkV278Skb_qJk9SwGoWtKp7-_9GbnQ2STZzN3_yO_cDadf5XiyaEblbkB5pihZLp3GoeNDtmQwEGxropfCjELL6_nZs' }}
                                        n2={{ name: 'Alex K.', initials: 'AK', color: 'purple' }}
                                        mgr={{ name: 'David S.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDn68uL1cuUQyg7WQIuS17V7tool_8JSrUQWthPI2jr8Lg8QAvge4H-6yuf1hdlBiT2BMfUF08-dHHu-R25qA1IUc4LR_7uKqrnsOCv5pqWhQbYCfDLKgn5Hzme004c2uYLzuzNzaL068361JE3NqchAiVzCNbE_dfxhQP1c4oLBa88uRRvrHhIJqI32641wF5wwalUywYCb3cry-kDlYj4ojUERlixSr8MCai2HQRQVhIerVRz8gstIf1_R3JRN5soSfSARWnplA' }}
                                    />
                                    <ScheduleRow
                                        date="Fev 16"
                                        day="Domingo"
                                        isWeekend
                                        n1={{ name: 'Brian R.', initials: 'BR', color: 'orange' }}
                                        n2={{ name: 'Catherine L.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5-2ca7lKaOkgO3rT46nukvLXaMYB_o5pElK9jrUuAMcTVWpE9sy18gpy50x-Qz42uCPiqbnTlswm4EJ9qpOOFaNF4M0FVmNdI0TGIHek38ei4q_YX_rPBDrKO0cVTkJuQzgsNQRiZsXTnL5z0fxTy_1BXgsTvJ1MN6N-h2CtzJQiFe-8rDc8sJfLE7_DYBO1qxRlhgGwCieL3KoeV8mH3doR4D8ZNS10D75hIOHOGkFoUbjXnuHiqpw0gyM2UjEMRC2pLkzbAVI4' }}
                                        mgr={{ name: 'George C.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0vcg4BS0f52Xk_yBkIkMJVZwhaaeF4byymUfAh_Nha4GUeLQP7xIQzvYEHMkVKgOXwgqMQx96Fy6k5m5Ua99MRKbUESaRrfcseYVuy0G9aNjCYapiTFR7MquD7cYXFKavbjsC8E7xSUlfk-n2tX6cCtlNSFQdnUnTwfM-OLaIvXzXMsRQ4HTKgiOirapwzt5mV1WkY0fosbsJX_0Qhq6jB9xqNSSxJf92Rw7T2AB9tqRxYz2vuQxgseWxphoR4GymRqwinPbqREQ' }}
                                    />
                                    <ScheduleRow
                                        date="Fev 22"
                                        day="Sábado"
                                        isWeekend
                                        n1={{ name: 'Emily D.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHQa6sfSJnbacpn-fWsf2nOQ4C6JzoMlrRpr7xs9b5-TGwo_C_AfkakqscWONn4-6qTtFptlqzf7yhzWs_QYx-aXKeyKWBV-pyrJKXKMzgQWDQzyqjWPKihnVifFizwxUgpuj-ELan_YelJGpQb3YgAaRZDaR3S0jqWfeHKJyRvUIgL-67UsoF_XJOr0-YM1bxW0_5Mr5nE-UZei0C7pzJbrDh6vd-_iv97MpQ8d0DUT_nFdtgHBhvInbsFUeirsYfBcuO76IcCaY' }}
                                        n2={{ name: 'Michael C.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD14PvxpPYcvfga110syZUq0_RzNdzkx-LvGf96WWfqQ7cwahzoYDDq4NEX8s8p6rfbUbB6HdPy5q2_N_uHJkwcbrcQI1wI1MQPATQBEshJwFldZl3MQA3REa9zxlC2rkq9nGeCGI_Mcm6xU_CnYXSOvjlYIIhUg84u7nJeqdZAuq-f6zllCd2x8AOQWMU_Mduqbt9ohljL5Dn21YMW1cRaKnulMbUlJgOleCLp0C3NEPLsOtkhlIugIpN0xpgfR0pjAIFf-PsOhK8' }}
                                        mgr={{ name: 'Lisa W.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3ZlnNer-mroEIrfoVLKA9Q41k7gVthvdp7c_6iIRaETXEOjsL0gGxEJq7XqBC5pCgW_p7ugECzFVb2Q5nTFSzci4Rl1FnsnO32TgrFv0_HQUtlWJLB0BVZznE1f0uInnjnNWDIhHjX1x4tLh0kllO1ztjshXiGcWF69n3v4CqNxTfxr4xdXqyJ0jkf3VpmQsm9VGwZ4TxbDPvZFdI8pq8qhgGcXtI5hXb7lAZHYP7rSdC_XOJcysJSRxjcjM2_8BXg_t6-HmtZ9g' }}
                                    />
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-auto p-4 border-t border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-center">
                            <button className="text-[#a17745] dark:text-orange-300 font-bold text-sm hover:text-primary transition-colors flex items-center gap-1 mx-auto">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Ver Escala Completa do Mês
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 p-4 bg-[#fcfaf8] dark:bg-[#2c2217] rounded-xl border border-[#eaddcd] dark:border-gray-800 text-sm text-[#a17745] dark:text-orange-300 font-medium">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <p><strong>Nota:</strong> Os plantões estão sujeitos a alterações. Em caso de imprevistos, contatar o RH para realocações com 48h de antecedência.</p>
                    </div>
                </div>
            </div>

            <footer className="mt-8 pt-8 border-t border-[#eaddcd] dark:border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-center text-sm text-[#a17745] dark:text-orange-300 gap-4">
                <p className="font-semibold cursor-default">© 2025 Prestek Intranet. Portal Interno. Todos os direitos reservados.</p>
                <div className="flex gap-6 font-bold">
                    <a className="hover:text-primary transition-colors" href="#">Política de Plantões</a>
                    <a className="hover:text-primary transition-colors" href="#">Regras de Descanso</a>
                </div>
            </footer>
        </main>
    );
}

// Componentes estendidos/subcomponentes

function CalendarDay({ day, isToday, active }) {
    let classes = "size-9 mx-auto flex items-center justify-center text-sm rounded-full font-bold transition-transform cursor-pointer ";

    if (isToday) {
        classes += "bg-primary text-white shadow-md shadow-primary/30 hover:scale-110";
    } else if (active) {
        classes += "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30 hover:scale-110";
    } else {
        classes += "text-[#1d150c] dark:text-white hover:bg-[#fcfaf8] dark:bg-[#2c2217] hover:text-primary border border-transparent hover:border-[#eaddcd] dark:border-gray-800";
    }

    return (
        <button className={classes}>{day}</button>
    );
}

function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr }) {
    let rowClasses = "transition-colors group hover:bg-[#fcfaf8] dark:bg-[#2c2217] ";

    if (isToday) {
        rowClasses += "bg-primary/5 border-l-4 border-l-primary";
    } else if (isWeekend) {
        rowClasses += "bg-[#fcfaf8] dark:bg-[#2c2217]/50";
    }

    return (
        <tr className={rowClasses}>
            <td className={`px-6 py-4 font-black ${isToday ? 'text-primary' : 'text-[#1d150c] dark:text-white'}`}>{date}</td>
            <td className={`px-6 py-4 font-semibold ${isWeekend ? 'text-[#a17745] dark:text-orange-300' : 'text-[#1d150c] dark:text-white'}`}>{day}</td>
            <td className="px-6 py-4"><UserAvatar user={n1} /></td>
            <td className="px-6 py-4"><UserAvatar user={n2} allowEmpty /></td>
            <td className="px-6 py-4"><UserAvatar user={mgr} /></td>
        </tr>
    );
}

function UserAvatar({ user, allowEmpty }) {
    if (!user && allowEmpty) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">
                Não atribuído
            </span>
        );
    }

    if (!user) return null;

    let avatarBgClasses = "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-[#eaddcd] dark:border-gray-800 ";

    if (user.color === 'purple') {
        avatarBgClasses += "bg-purple-100 text-purple-600 border-purple-200";
    } else if (user.color === 'orange') {
        avatarBgClasses += "bg-orange-100 text-orange-600 border-orange-200";
    } else {
        avatarBgClasses += "bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white";
    }

    return (
        <div className="flex items-center gap-3">
            {user.img ? (
                <div
                    className="size-8 rounded-full bg-cover bg-center border border-[#eaddcd] dark:border-gray-800 shrink-0"
                    title={user.name}
                    style={{ backgroundImage: `url('${user.img}')` }}
                ></div>
            ) : (
                <div className={avatarBgClasses} title={user.name}>
                    {user.initials}
                </div>
            )}
            <div className="font-bold text-[#1d150c] dark:text-white whitespace-nowrap">{user.name}</div>
        </div>
    );
}
