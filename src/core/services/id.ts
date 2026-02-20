export function newId(): string {
    //Node >=18 (y navegadores modernos) que soportan crypto.randomUUID()
    return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}