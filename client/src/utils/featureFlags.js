export const FEATURE_FLAGS = {
  BLUETOOTH_EV_CONTROLLER: {
    enabled: true,
    requiresDevMenu: true,
    productionEnabled: false
  },
  MASCOTE_CONTEST: {
    enabled: true,
    requiresDevMenu: true,
    productionEnabled: false
  }
};

export function isFeatureEnabled(featureName, username, hasDevAccess = false) {
  const feature = FEATURE_FLAGS[featureName];
  
  if (!feature || !feature.enabled) return false;
  
  // Se requer acesso ao Dev, verificar se o usuário tem
  if (feature.requiresDevMenu && !hasDevAccess) return false;
  
  // Se não requer Dev, verificar se é usuário de teste
  if (!feature.requiresDevMenu && feature.betaUsers) {
    if (feature.betaUsers.includes(username)) return true;
  }
  
  // Se não é usuário de teste, só ativa em produção quando habilitado
  return feature.productionEnabled;
}
