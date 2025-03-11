export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  memberSince: string;
  isVerified: boolean;
  avatar?: string;
}

export interface Connection {
  id: number;
  userId: number;
  aiServiceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface Capsule {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
}

export interface VerifiedData {
  id: number;
  capsuleId: number;
  dataType: string;
  value: string;
  verifiedAt: string;
}

export interface Activity {
  id: number;
  userId: number;
  type: string;
  description: string;
  createdAt: string;
  // UI properties
  title?: string;
  time?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}