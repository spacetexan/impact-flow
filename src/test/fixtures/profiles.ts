import { Profile, CreateProfileInput } from '@/domain';

export const testProfiles: Profile[] = [
  { id: 'profile-1', name: 'Alice Johnson', role: 'Developer' },
  { id: 'profile-2', name: 'Bob Smith', role: 'Designer', avatar: 'https://example.com/bob.png' },
  { id: 'profile-3', name: 'Charlie Brown', role: 'PM' },
];

export const validCreateProfileInput: CreateProfileInput = {
  name: 'New User',
  role: 'Tester',
};

export const validCreateProfileInputWithAvatar: CreateProfileInput = {
  name: 'New User',
  role: 'Tester',
  avatar: 'https://example.com/avatar.png',
};

export const invalidCreateProfileInputs = {
  emptyName: { name: '', role: 'Developer' },
  emptyRole: { name: 'Test User', role: '' },
  invalidAvatar: { name: 'Test User', role: 'Developer', avatar: 'not-a-url' },
};
