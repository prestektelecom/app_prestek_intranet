import { useEffect, useState } from 'react';
import { resolveNomeSetor } from '../utils/resolveSetor';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';
import { nomeCurto } from '../utils/nomeExibicao';

const defaultAvatar = AVATAR_PNGS[7];

/**
 * Nome curto, cargo/setor resolvido e avatar do usuário logado, calculados uma
 * vez no `App` e passados por prop para Sidebar e Header. Antes cada um
 * recalculava tudo e sondava o localStorage a cada 1,5s.
 *
 * Avatar: foto do IXC, sobrescrita pelo que Configurações salvou localmente;
 * Configurações dispara `stitch:avatar` ao salvar (e `storage` cobre outra aba).
 */
export function useProfileDisplay(user) {
  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;
  const foto = func.foto_perfil;
  const displayName = nomeCurto(safeName) || 'Usuário';

  const [avatarUrl, setAvatarUrl] = useState(() => resolveAvatarUrl(foto) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);

  useEffect(() => {
    if (!user) return;
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
      .then(setCargoName)
      .catch((err) => console.error('Erro ao resolver setor do usuário:', err));
  }, [user, safeDepto, safeRole, user?.nome_grupo]);

  useEffect(() => {
    const sync = () => {
      let resolved = resolveAvatarUrl(foto) || defaultAvatar;
      if (safeId) {
        try {
          const saved = JSON.parse(localStorage.getItem(`stitch_profile_${safeId}`) || 'null');
          if (saved?.avatarUrl) resolved = resolveAvatarUrl(saved.avatarUrl) || resolved;
        } catch (_) { /* ignora perfil local corrompido */ }
      }
      setAvatarUrl(resolved);
    };
    sync();
    window.addEventListener('stitch:avatar', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('stitch:avatar', sync);
      window.removeEventListener('storage', sync);
    };
  }, [safeId, foto]);

  return { displayName, cargoName, avatarUrl, safeId };
}

export default useProfileDisplay;
