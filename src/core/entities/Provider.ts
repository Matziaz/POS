export type ProviderId = string;

export interface ProviderProps {
  id: ProviderId;
  name: string;
  telephone?: string | null;
  email?: string | null;
  image: string;
}

export class Provider {
  private constructor(private readonly props: ProviderProps) {}

  static create(input: ProviderProps): Provider {
    if (!input.id?.trim()) throw new Error("Provider.id is required");
    if (!input.name?.trim()) throw new Error("Provider.name is required");

    return new Provider({
      ...input,
      image: input.image?.trim() ? input.image.trim() : "",
    });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get telephone() { return this.props.telephone ?? null; }
  get email() { return this.props.email ?? null; } 
  get image() { return this.props.image; }
  
  toJSON(){return { ...this.props };} 
}