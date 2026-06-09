export interface StatusBadgeAppearance {
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

const DEFAULT_APPEARANCE: StatusBadgeAppearance = {
  label: '',
  backgroundColor: '#e2e8f0',
  textColor: '#334155',
  borderColor: '#cbd5e1'
};

const STATUS_APPEARANCE: Record<string, StatusBadgeAppearance> = {
  active: {
    label: 'Activo',
    backgroundColor: '#dcfce7',
    textColor: '#166534',
    borderColor: '#bbf7d0'
  },
  maintenance: {
    label: 'Mantenimiento',
    backgroundColor: '#fef3c7',
    textColor: '#92400e',
    borderColor: '#fde68a'
  },
  pending: {
    label: 'Pendiente',
    backgroundColor: '#fef3c7',
    textColor: '#92400e',
    borderColor: '#fde68a'
  },
  confirmed: {
    label: 'Confirmada',
    backgroundColor: '#dcfce7',
    textColor: '#166534',
    borderColor: '#bbf7d0'
  },
  cancelled: {
    label: 'Cancelada',
    backgroundColor: '#fee2e2',
    textColor: '#991b1b',
    borderColor: '#fecaca'
  },
  completed: {
    label: 'Completada',
    backgroundColor: '#dbeafe',
    textColor: '#1d4ed8',
    borderColor: '#bfdbfe'
  }
};

export function normalizeStatusValue(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value).trim().toLowerCase();
}

export function getStatusBadgeAppearance(value: string | number | null | undefined): StatusBadgeAppearance {
  const normalizedValue = normalizeStatusValue(value);

  if (!normalizedValue) {
    return DEFAULT_APPEARANCE;
  }

  return STATUS_APPEARANCE[normalizedValue] ?? {
    ...DEFAULT_APPEARANCE,
    label: String(value)
  };
}
