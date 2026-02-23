export type RoleId = string;

export interface RoleProps {
  id: RoleId;
  type: string;
}

export class Role {
  private constructor(private readonly props: RoleProps) {}

  static create(input: RoleProps): Role {
    if (!input.id?.trim()) throw new Error("Role.id is required");
    if (!input.type?.trim()) throw new Error("Role.name is required");

    return new Role(input);
  }

  get id() { return this.props.id; }
  get type() { return this.props.type; }
  toJSON(){return { ...this.props };}
}