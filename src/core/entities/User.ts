export type UserId = string;

export interface UserProps {
    id: UserId;
    username: string;
    password: string;
    roleId: string;
    createdAt: string;
}

export class User {
    private constructor(private readonly props: UserProps) {}

    static create(input: Omit<UserProps, "createdAt"> & { createdAt?: string }): User {
        const createdAt = input.createdAt ?? new Date().toISOString();

        if (!input.id?.trim()) throw new Error("User.id is required");
        if (!input.username?.trim()) throw new Error("User.username is required");
        if (!input.password?.trim()) throw new Error("User.password is required");
        if (!input.roleId?.trim()) throw new Error("User.roleId is required");

        return new User({ ...input, createdAt });
    }

    get id() { return this.props.id; }
    get username() { return this.props.username; }
    get password() { return this.props.password; }
    get roleId() { return this.props.roleId; }
    get createdAt() { return this.props.createdAt; }

    toJSON() {
        return { ...this.props };
    }
}
