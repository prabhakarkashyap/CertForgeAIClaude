export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileInput {
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string | null;
}
