import { doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { Shift } from "../../types/Shift";

/**
 * Удаляет все поля со значением undefined из объекта (рекурсивно)
 */
function removeUndefinedFields(obj: any): any {
  if (obj === null) {
    return null;
  }

  if (obj === undefined) {
    return undefined; // будет отфильтровано на уровне выше
  }

  // Обработка массивов
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeUndefinedFields(item))
      .filter(item => item !== undefined);
  }

  // Обработка объектов
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== undefined) {
          const cleanedValue = removeUndefinedFields(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
      }
    }
    return cleaned;
  }

  // Примитивы и специальные объекты (например, Timestamp) возвращаем как есть
  return obj;
}

export const saveUserShifts = async (userId: string, shifts: Shift[]) => {
  try {
    const userRef = doc(db, "users", userId);

    // Фильтруем некорректные смены
    const validShifts = shifts.filter(shift => {
      return shift &&
             shift.id &&
             shift.date &&
             shift.post &&
             shift.startTime &&
             shift.endTime;
    });

    // Сериализуем смены для Firebase (убеждаемся, что все объекты Plain Objects)
    // Создаем полный объект и затем очищаем от undefined
    const serializedShifts = validShifts.map(shift => {
      if (!shift.post) {
        throw new Error(`Shift ${shift.id} has no post`);
      }

      const postData: any = {
        id: shift.post.id,
        title: shift.post.title,
        hourlyRate: shift.post.hourlyRate,
        defaultStartTime: shift.post.defaultStartTime,
        defaultEndTime: shift.post.defaultEndTime,
      };

      // Добавляем tasks только если они есть и не undefined
      if (shift.post.tasks !== undefined && shift.post.tasks !== null) {
        postData.tasks = shift.post.tasks;
      }

      const shiftData: any = {
        id: shift.id,
        date: shift.date,
        post: postData,
        startTime: shift.startTime,
        endTime: shift.endTime,
      };

      // Добавляем remark только если он определен
      if (shift.remark !== undefined && shift.remark !== null && shift.remark !== '') {
        shiftData.remark = shift.remark;
      }

      return shiftData;
    });

    // Удаляем все undefined значения рекурсивно перед сохранением
    const cleanedShifts = removeUndefinedFields(serializedShifts);

    // Дополнительная проверка - убеждаемся, что нет undefined или null в массиве
    const finalShifts = cleanedShifts.filter((shift: any) => {
      return shift !== undefined &&
             shift !== null &&
             shift.id !== undefined &&
             shift.date !== undefined &&
             shift.post !== undefined;
    });

    await setDoc(userRef, { shifts: finalShifts }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error saving shifts for user:", userId);
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};

export const saveMultipleUsersShifts = async (shiftsByUserId: Map<string, Shift[]>) => {
  try {
    const updates = Array.from(shiftsByUserId.entries()).map(([userId, shifts]) =>
      saveUserShifts(userId, shifts)
    );

    await Promise.all(updates);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving multiple users shifts:", error);
    return { success: false, error: error.message };
  }
};

