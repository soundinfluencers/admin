export type TUserRole = "admin";
export type TVerifiedStatus = "accept" | "decline" | "waitForAdmin" | "waitForUser" | "negotiation";

export interface IAdmin {
  firstName: string;
  role: TUserRole;
  verifiedStatus: TVerifiedStatus;
}

export type TLoginRequest = {
  email: string;
  password: string;
  role: TUserRole;
};

export type TLoginResponse = {
  accessToken: string;
};
