import { create } from 'zustand';
import type { User } from '@/types';

interface UserState {
    users: User[];
    selectedUser: User | null;
    setUsers: (users: User[]) => void;
    setSelectedUser: (user: User | null) => void;
    addUser: (user: User) => void;
    updateUser: (id: number, user: User) => void;
    removeUser: (id: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    selectedUser: null,

    setUsers: (users) => set({ users }),

    setSelectedUser: (user) => set({ selectedUser: user }),

    addUser: (user) =>
        set((state) => ({
            users: [...state.users, user],
        })),

    updateUser: (id, updatedUser) =>
        set((state) => ({
            users: state.users.map((user) => (user.id === id ? updatedUser : user)),
        })),

    removeUser: (id) =>
        set((state) => ({
            users: state.users.filter((user) => user.id !== id),
        })),
}));
