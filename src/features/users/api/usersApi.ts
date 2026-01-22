/**
 * Users API
 * RTK Query endpoints for user management
 */

import { baseApi } from '../../../shared/api/baseApi';
import type {
  CreateUserRequest,
  CreateUserResponse,
  User,
  UserRole,
} from '../../../shared/types/user.types';
import { getRoleName } from '../../../shared/types/user.types';

type RawUser = {
  userId: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  facilities: number[];
  phone_number?: string | null;
};

type GetUsersResponse = {
  users: RawUser[];
};

export type UpdateUserFacilitiesPatch = {
  add?: number[];
  remove?: number[];
};

export type UpdateUserRequest = {
  userId: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  /**
   * Backend appears to support two shapes (per provided screenshots):
   * - facilities: number[]                  (replace)
   * - facilities: { add: number[]; remove: number[] }  (patch)
   */
  facilities?: number[] | UpdateUserFacilitiesPatch;
  role_id?: number;
};

export type UpdateUserResponse = {
  code: string; // e.g. "SUCCESS_USER_UPDATED"
  userId: string;
};

export type DeleteUserRequest = {
  userId: string;
};

export type DeleteUserResponse = {
  code: string; // e.g. "SUCCESS_USER_DELETED"
  userId: string;
};

const normalizeUsers = (response: GetUsersResponse): User[] => {
  const grouped = new Map<string, User>();

  (response.users || []).forEach((raw) => {
    const role = getRoleName(raw.role_id) ?? (raw.role_id === 3 ? ('User' as UserRole) : null);
    const existing = grouped.get(raw.userId);

    const mergedFacilities = Array.from(
      new Set([...(existing?.facilities ?? []), ...(raw.facilities ?? [])])
    ).sort((a, b) => a - b);

    const user: User = {
      userId: raw.userId,
      email: raw.email,
      firstName: raw.first_name,
      lastName: raw.last_name,
      role: role ?? ('User' as UserRole),
      roleId: raw.role_id,
      facilities: mergedFacilities,
    };

    grouped.set(raw.userId, user);
  });

  return Array.from(grouped.values()).sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
  );
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: '/getusers',
        method: 'GET',
      }),
      transformResponse: (response: GetUsersResponse) => normalizeUsers(response),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: (userData) => ({
        url: '/createuser',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<UpdateUserResponse, UpdateUserRequest>({
      query: (payload) => ({
        url: '/updateuser',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<DeleteUserResponse, DeleteUserRequest>({
      query: (payload) => ({
        url: '/deleteuser',
        method: 'DELETE',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
