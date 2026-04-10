export type RetailContext = string;

export interface AppConfigurationProps {
  id: string;
  retailContext: string;
  isActive: string | number | null;
}

export class AppConfiguration {
  private constructor(private readonly props: AppConfigurationProps) {}

  static create(input: AppConfigurationProps): AppConfiguration {
    const id = input.id?.trim();
    const retailContext = input.retailContext?.trim().toLowerCase();
    const isActive = typeof input.isActive === "number"
      ? input.isActive
      : input.isActive?.trim() ?? null;

    if (!id) throw new Error("AppConfiguration.id is required");
    if (!retailContext) throw new Error("AppConfiguration.retailContext is required");

    return new AppConfiguration({
      id,
      retailContext,
      isActive,
    });
  }

  get id() { return this.props.id; }
  get retailContext() { return this.props.retailContext; }
  get isActive() { return this.props.isActive; }

  get isSetupComplete(): boolean {
    const raw = this.props.isActive;
    if (typeof raw === "number") return raw === 1;
    const normalized = (raw ?? "").toLowerCase();
    return normalized === "1" || normalized === "true";
  }

  toJSON(): AppConfigurationProps {
    return { ...this.props };
  }
}
