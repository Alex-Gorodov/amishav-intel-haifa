import { createAction } from "@reduxjs/toolkit";
import { User } from "../types/User";
import { Availability } from "../types/Availability";
import { Document } from "../types/Document";

export const setUsersDataLoading = createAction<{isUsersDataLoading: boolean}>('data/setUsersDataLoading');
export const loadUsers = createAction<{users: User[]}>('data/loadUsers');

export const updateAvailability = createAction<{user: User, availability: Availability[]}>('data/updateAvailability');

export const uploadDocument = createAction<{user: User, document: Document}>('data/uploadDocument');
