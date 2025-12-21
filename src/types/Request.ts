import { Shift } from '../types/Shift';

export enum RequestStatus {
  PendingUser = 'pending_user',
  PendingAdmin = 'pending_admin',
  Approved = 'approved',
  Rejected = 'rejected',
}

export type Request<T> = {
  id: string;
  type: T;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  details?: string;
  firstUserId: string;
  secondUserId: string;
};

export type SwapShiftRequest = Request<'swap'> & {
  firstShiftId: string;
  secondShiftId: string;
};

export type GiveShiftRequest = Request<'give'> & {
  shiftId: string;
};

export type GiveRequestWithShift = GiveShiftRequest & {
  fromShift: Shift | null;
};

export type SwapRequestWithShifts = SwapShiftRequest & {
  fromShift: Shift | null;
  toShift: Shift | null;
};

export type RequestWithShift =
  | GiveRequestWithShift
  | SwapRequestWithShifts;
