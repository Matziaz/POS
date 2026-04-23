export interface PreCloseAlertPayload {
  businessDate: string;
  triggeredAt: string;
  message: string;
}

export interface PreCloseDecisionInput {
  now: Date;
  hasOpenRegister: boolean;
  lastAlertBusinessDate: string | null;
}

export interface PreCloseDecision {
  emit: boolean;
  businessDate: string;
}

const PRE_CLOSE_HOUR = 23;
const PRE_CLOSE_MINUTE = 45;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function toLocalBusinessDate(value: Date): string {
  const year = value.getFullYear();
  const month = pad2(value.getMonth() + 1);
  const day = pad2(value.getDate());
  return `${year}-${month}-${day}`;
}

export function isAtOrAfterPreCloseTime(value: Date): boolean {
  const hours = value.getHours();
  const minutes = value.getMinutes();

  if (hours > PRE_CLOSE_HOUR) return true;
  if (hours < PRE_CLOSE_HOUR) return false;
  return minutes >= PRE_CLOSE_MINUTE;
}

export function shouldEmitPreCloseAlert(input: PreCloseDecisionInput): PreCloseDecision {
  const businessDate = toLocalBusinessDate(input.now);

  if (!input.hasOpenRegister) {
    return { emit: false, businessDate };
  }

  if (!isAtOrAfterPreCloseTime(input.now)) {
    return { emit: false, businessDate };
  }

  if (input.lastAlertBusinessDate === businessDate) {
    return { emit: false, businessDate };
  }

  return { emit: true, businessDate };
}

export function buildPreCloseAlertPayload(now: Date, businessDate: string): PreCloseAlertPayload {
  return {
    businessDate,
    triggeredAt: now.toISOString(),
    message: "Pre-cierre disponible: confirma el corte de caja.",
  };
}
