import { describe, expect, it } from "vitest";
import {
  isAtOrAfterPreCloseTime,
  shouldEmitPreCloseAlert,
  toLocalBusinessDate,
} from "../preCloseScheduler";

describe("preCloseScheduler", () => {
  it("emits only once per business date after pre-close time when register is open", () => {
    const now = new Date(2026, 3, 22, 23, 45, 0, 0);
    const businessDate = toLocalBusinessDate(now);

    const first = shouldEmitPreCloseAlert({
      now,
      hasOpenRegister: true,
      lastAlertBusinessDate: null,
    });
    expect(first.emit).toBe(true);
    expect(first.businessDate).toBe(businessDate);

    const second = shouldEmitPreCloseAlert({
      now,
      hasOpenRegister: true,
      lastAlertBusinessDate: businessDate,
    });
    expect(second.emit).toBe(false);
    expect(second.businessDate).toBe(businessDate);
  });

  it("does not emit before time or without open register", () => {
    const beforeTime = new Date(2026, 3, 22, 23, 44, 0, 0);
    expect(isAtOrAfterPreCloseTime(beforeTime)).toBe(false);

    const decisionWithoutRegister = shouldEmitPreCloseAlert({
      now: new Date(2026, 3, 22, 23, 50, 0, 0),
      hasOpenRegister: false,
      lastAlertBusinessDate: null,
    });
    expect(decisionWithoutRegister.emit).toBe(false);
  });
});
