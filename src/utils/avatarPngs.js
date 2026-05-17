import png1 from '../image/avatar/bald-boy-3d-icon-png-download-7944076.png';
import png2 from '../image/avatar/bald-boy-3d-icon-png-download-7944077.png';
import png3 from '../image/avatar/bald-boy-3d-icon-png-download-7944078.png';
import png4 from '../image/avatar/bald-boy-3d-icon-png-download-7944079.png';
import png5 from '../image/avatar/bald-boy-3d-icon-png-download-7944080.png';
import png6 from '../image/avatar/bald-boy-3d-icon-png-download-7944093.png';
import png7 from '../image/avatar/bald-boy-3d-icon-png-download-7944094.png';
import png8 from '../image/avatar/boy-avatar-3d-icon-png-download-7944049.png';
import png9 from '../image/avatar/boy-avatar-3d-icon-png-download-7944050.png';
import png10 from '../image/avatar/boy-avatar-3d-icon-png-download-7944071.png';
import png11 from '../image/avatar/boy-avatar-3d-icon-png-download-7944072.png';
import png12 from '../image/avatar/boy-avatar-3d-icon-png-download-7944073.png';
import png13 from '../image/avatar/boy-avatar-3d-icon-png-download-7944074.png';
import png14 from '../image/avatar/boy-avatar-3d-icon-png-download-7944075.png';
import png15 from '../image/avatar/boy-avatar-3d-icon-png-download-7944081.png';
import png16 from '../image/avatar/boy-avatar-3d-icon-png-download-7944082.png';
import png17 from '../image/avatar/boy-avatar-3d-icon-png-download-7944083.png';
import png18 from '../image/avatar/boy-avatar-3d-icon-png-download-7944084.png';
import png19 from '../image/avatar/boy-avatar-3d-icon-png-download-7944085.png';
import png20 from '../image/avatar/boy-avatar-3d-icon-png-download-7944086.png';
import png21 from '../image/avatar/boy-avatar-3d-icon-png-download-7944087.png';
import png22 from '../image/avatar/boy-avatar-3d-icon-png-download-7944088.png';
import png23 from '../image/avatar/boy-avatar-3d-icon-png-download-7944089.png';
import png24 from '../image/avatar/boy-avatar-3d-icon-png-download-7944090.png';
import png25 from '../image/avatar/boy-avatar-3d-icon-png-download-7944091.png';
import png26 from '../image/avatar/boy-avatar-3d-icon-png-download-7944092.png';
import png27 from '../image/avatar/boy-avatar-3d-icon-png-download-7944095.png';
import png28 from '../image/avatar/boy-avatar-3d-icon-png-download-7944096.png';
import png29 from '../image/avatar/boy-avatar-3d-icon-png-download-7944097.png';
import png30 from '../image/avatar/boy-avatar-3d-icon-png-download-7944098.png';
import png31 from '../image/avatar/boy-avatar-3d-icon-png-download-7944099.png';
import png32 from '../image/avatar/boy-avatar-3d-icon-png-download-7944100.png';
import png33 from '../image/avatar/girl-avatar-3d-icon-png-download-7944047.png';
import png34 from '../image/avatar/girl-avatar-3d-icon-png-download-7944051.png';
import png35 from '../image/avatar/girl-avatar-3d-icon-png-download-7944052.png';
import png36 from '../image/avatar/girl-avatar-3d-icon-png-download-7944053.png';
import png37 from '../image/avatar/girl-avatar-3d-icon-png-download-7944054.png';
import png38 from '../image/avatar/girl-avatar-3d-icon-png-download-7944055.png';
import png39 from '../image/avatar/girl-avatar-3d-icon-png-download-7944056.png';
import png40 from '../image/avatar/girl-avatar-3d-icon-png-download-7944057.png';
import png41 from '../image/avatar/girl-avatar-3d-icon-png-download-7944058.png';
import png42 from '../image/avatar/girl-avatar-3d-icon-png-download-7944059.png';
import png43 from '../image/avatar/girl-avatar-3d-icon-png-download-7944060.png';
import png44 from '../image/avatar/girl-avatar-3d-icon-png-download-7944061.png';
import png45 from '../image/avatar/girl-avatar-3d-icon-png-download-7944062.png';
import png46 from '../image/avatar/girl-avatar-3d-icon-png-download-7944063.png';
import png47 from '../image/avatar/girl-avatar-3d-icon-png-download-7944064.png';
import png48 from '../image/avatar/girl-avatar-3d-icon-png-download-7944065.png';

export const AVATAR_PNGS = [
    png1, png2, png3, png4, png5, png6, png7, png8, png9, png10,
    png11, png12, png13, png14, png15, png16, png17, png18, png19, png20,
    png21, png22, png23, png24, png25, png26, png27, png28, png29, png30,
    png31, png32, png33, png34, png35, png36, png37, png38, png39, png40,
    png41, png42, png43, png44, png45, png46, png47, png48,
];

export function resolveAvatarUrl(raw) {
    if (!raw) return null;
    if (typeof raw === 'string' && raw.startsWith('__png_idx:')) {
        const idx = parseInt(raw.split(':')[1], 10);
        return AVATAR_PNGS[idx] ?? null;
    }
    if (typeof raw === 'string') return raw;
    return null;
}
