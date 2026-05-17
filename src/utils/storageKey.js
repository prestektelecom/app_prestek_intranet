export function resolveUserStorageKey(user) {
    const id = user?.funcionario?.id ?? user?.id;
    if (!id || String(id) === '0' || String(id) === '0000') return null;
    return `stitch_profile_${id}`;
}
