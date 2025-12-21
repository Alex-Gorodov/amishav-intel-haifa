import { GiveShiftRequest, RequestWithShift, SwapShiftRequest } from "../types/Request";
import { State } from "../types/State";

export function getRequestsWithShifts(
  requests: (GiveShiftRequest | SwapShiftRequest)[],
  users: State['data']['users']
): RequestWithShift[] {

  const allShifts = users.flatMap(u => u.shifts || []);

  return requests.map(req => {
    if (req.type === 'give') {
      const shift = allShifts.find(s => s.id === req.shiftId) || null;

      return {
        ...req,
        fromShift: shift,
      };
    }

    // swap
    const fromShift =
      allShifts.find(s => s.id === req.firstShiftId) || null;
    const toShift =
      allShifts.find(s => s.id === req.secondShiftId) || null;

    return {
      ...req,
      fromShift,
      toShift,
    };
  });
}
